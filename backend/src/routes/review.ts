import { Router } from 'express'
import passport from 'passport'
import jwtStrategy from '../auth/jwtStrategy.ts'
import type { ICard, IUser, IUserCardProgress } from '../db/schema.ts'
import { Card, Deck, UserCardProgress } from '../db/schema.ts'
import { calculateSrs } from '../srs.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

const getQuestionType = (repetitions: number): string => {
  if (repetitions === 0) return 'image_word_multiple_choice'
  if (repetitions === 1) return 'image_multiple_choice'
  if (repetitions === 2) return 'word_translation_multiple_choice'
  if (repetitions === 3) return 'translation_image_multiple_choice'
  if (repetitions === 4) return 'image_type_answer'
  return 'word_multiple_choice_image'
}

const getMultipleChoiceOptions = async (cardId: string, deckId: string, correctAnswer: string) => {
  const deck = await Deck.findById(deckId).populate('cards')
  if (!deck) return []

  const wrongOptions = (deck.cards as any[])
    .filter((card: ICard) => card._id.toString() !== cardId && card.answer !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  return wrongOptions
}

const createQuestionData = async (card: ICard, userProgress: Partial<IUserCardProgress>) => {
  const deck = await Deck.findOne({ cards: card._id })
  if (!deck) {
    throw new Error(`Card ${card._id} does not belong to any deck`)
  }
  const deckId = deck._id.toString()
  const questionType = getQuestionType(userProgress.repetitions!)

  const questionData: any = {
    cardId: card._id,
    questionType,
    correctAnswer: card.answer,
    prompt: card.prompt,
    imageUrl: card.imageUrl,
    word: card.answer,
  }

  if (questionType.includes('multiple_choice')) {
    const wrongOptions = await getMultipleChoiceOptions(card._id.toString(), deckId, card.answer)
    const allOptions = [card, ...wrongOptions].sort(() => Math.random() - 0.5)

    if (questionType.includes('image')) {
      questionData.options = allOptions.map((opt: ICard) => ({
        text: opt.answer,
        imageUrl: opt.imageUrl,
      }))
    } else {
      questionData.options = allOptions.map((opt: ICard) => opt.answer)
    }
  }
  return questionData
}

// builds a general review session of up to 10 cards
router.get('/session/general', async (req: any, res) => {
  try {
    const userId = (req.user as IUser)._id
    const sessionSize = 10

    const dueProgress = await UserCardProgress.find({
      userId,
      nextReviewAt: { $lte: new Date() },
    }).sort({ nextReviewAt: 1 }).populate('cardId')

    let sessionCards = dueProgress.map(p => p.cardId as unknown as ICard)

    if (sessionCards.length < sessionSize) {
      const reviewedCardIds = dueProgress.map(p => p.cardId)
      const learningProgress = await UserCardProgress.find({
        userId,
        _id: { $nin: reviewedCardIds },
      }).sort({ repetitions: 1, nextReviewAt: 1 }).limit(sessionSize - sessionCards.length).populate('cardId')
      
      sessionCards = [...sessionCards, ...learningProgress.map(p => p.cardId as unknown as ICard)]
    }

     if (sessionCards.length < sessionSize) {
        const reviewedCardIds = (await UserCardProgress.find({ userId })).map(p => p.cardId);
        const newCards = await Card.find({ _id: { $nin: reviewedCardIds } }).limit(sessionSize - sessionCards.length);
        sessionCards = [...sessionCards, ...newCards];
    }
    
    const progressMap = new Map(dueProgress.map((p) => [p.cardId.toString(), p]))

    const sessionQuestions = await Promise.all(
        sessionCards.slice(0, sessionSize).map(async (card) => {
            let progress = progressMap.get(card._id.toString());
            if (!progress) {
                progress = { repetitions: 0 } as any;
            }
            return createQuestionData(card, progress);
        })
    );
    
    res.json({ cards: sessionQuestions });

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create general review session' })
  }
})


// Get review session for a specific deck
router.get('/deck/:deckId', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { deckId } = req.params

    const deck = await Deck.findById(deckId).populate('cards')
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' })
    }

    const userProgress = await UserCardProgress.find({ userId, deckId })
    const progressMap = new Map(userProgress.map((p) => [p.cardId.toString(), p]))

    const now = new Date()
    const dueCards: ICard[] = []
    const learningCards: ICard[] = []

    for (const card of deck.cards as any[]) {
      const progress = progressMap.get(card._id.toString())
      if (!progress) {
        learningCards.push(card) // new card
      } else if (progress.nextReviewAt <= now) {
        dueCards.push(card) // due card
      } else if (progress.repetitions < 5) {
        learningCards.push(card) // not mastered, but not due yet
      }
    }

    dueCards.sort((a, b) => {
      const progressA = progressMap.get(a._id.toString())!
      const progressB = progressMap.get(b._id.toString())!
      return progressA.nextReviewAt.getTime() - progressB.nextReviewAt.getTime()
    })

    const sessionCards = [...dueCards, ...learningCards].slice(0, 10)

    const sessionQuestions = await Promise.all(
      sessionCards.map(async (card) => {
        let progress = progressMap.get(card._id.toString())
        if (!progress) {
          progress = { repetitions: 0 } as any
        }
        return createQuestionData(card, progress)
      })
    )

    res.json({
      deckId,
      cards: sessionQuestions,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create review session' })
  }
})

router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { cardId, rating } = req.body

    if (!cardId || !rating) {
      return res.status(400).json({ error: 'cardId and rating are required' })
    }

    let currentProgress = await UserCardProgress.findOne({ userId, cardId })

    if (!currentProgress) {
      const deck = await Deck.findOne({ cards: cardId })
      if (!deck) return res.status(404).json({ error: "Card's deck not found" })

      currentProgress = new UserCardProgress({
        userId,
        cardId,
        deckId: deck._id,
      })
    }

    const { repetitions, easeFactor, interval, nextReviewAt } = calculateSrs(
      {
        repetitions: currentProgress.repetitions,
        easeFactor: currentProgress.easeFactor,
        interval: currentProgress.interval,
      },
      rating
    )

    currentProgress.repetitions = repetitions
    currentProgress.easeFactor = easeFactor
    currentProgress.interval = interval
    currentProgress.nextReviewAt = nextReviewAt

    await currentProgress.save()

    res.status(200).json({ message: 'Progress updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

export default router