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
  // First exposure: Show everything to build the initial connection.
  if (repetitions === 0) return 'image_and_word_to_translation_mc' // Q: Image + "Cat", A: "Gato" (MC)
  // Second exposure: Recall the foreign word from an image.
  if (repetitions === 1) return 'image_to_word_mc' // Q: Image, A: "Cat" (MC)
  // Third exposure: Recall the translation from the foreign word.
  if (repetitions === 2) return 'word_to_translation_mc' // Q: "Cat", A: "Gato" (MC)
  // Fourth exposure: Test visual association.
  if (repetitions === 3) return 'word_to_image_mc' // Q: "Cat", A: Image of Cat (MC)
  // Getting harder: Active recall by typing.
  if (repetitions === 4) return 'image_to_type_answer' // Q: Image, A: Type "Cat"
  // Mastery test: Recall from native language.
  return 'translation_to_type_answer' // Q: "Gato", A: Type "Cat"
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
    questionType: questionType,
  }

  const wrongOptions = await getMultipleChoiceOptions(card._id.toString(), deckId, card.answer)
  const allOptions = [card, ...wrongOptions].sort(() => Math.random() - 0.5)

  // Build question and options based on type
  switch (questionType) {
    case 'image_and_word_to_translation_mc':
      questionData.prompt = card.prompt // e.g., "O que é isto?"
      questionData.imageUrl = card.imageUrl
      questionData.word = card.answer // "Cat"
      questionData.options = allOptions.map((opt: ICard) => opt.prompt) // Options: "Gato", "Cachorro", ...
      questionData.correctAnswer = card.prompt // CORRECT ANSWER IS THE TRANSLATION
      break

    case 'image_to_word_mc':
      questionData.prompt = 'What is this?'
      questionData.imageUrl = card.imageUrl
      questionData.options = allOptions.map((opt: ICard) => opt.answer) // Options: "Cat", "Dog", ...
      questionData.correctAnswer = card.answer // Correct answer is the word
      break

    case 'word_to_translation_mc':
      questionData.prompt = 'Translate this word:'
      questionData.word = card.answer // "Cat"
      questionData.options = allOptions.map((opt: ICard) => opt.prompt) // Options: "Gato", "Cachorro", ...
      questionData.correctAnswer = card.prompt // CORRECT ANSWER IS THE TRANSLATION
      break

    case 'word_to_image_mc':
      questionData.prompt = 'Which image represents this word?'
      questionData.word = card.answer // "Cat"
      questionData.options = allOptions.map((opt: ICard) => ({
        text: opt.answer, // Text is used for internal checking
        imageUrl: opt.imageUrl,
      }))
      questionData.correctAnswer = card.answer // Correct answer is the word
      break

    case 'image_to_type_answer':
      questionData.prompt = 'What is this in English?'
      questionData.imageUrl = card.imageUrl
      questionData.correctAnswer = card.answer
      break

    case 'translation_to_type_answer':
      questionData.prompt = `How do you say "${card.prompt}" in English?`
      questionData.correctAnswer = card.answer
      break
  }

  // This is the "correct answer" data for the flip-card feedback
  questionData.feedback = {
    word: card.answer,
    translation: card.prompt,
    imageUrl: card.imageUrl,
  }

  return questionData
}

// --- UPDATED: General Review Session Logic ---
router.get('/session/general', async (req: any, res) => {
  try {
    const userId = (req.user as IUser)._id
    const sessionSize = 10

    // 1. Prioritize cards that are due for review
    const dueProgress = await UserCardProgress.find({
      userId,
      nextReviewAt: { $lte: new Date() },
    })
      .sort({ nextReviewAt: 1 })
      .limit(sessionSize)
      .populate<{ cardId: ICard }>('cardId')

    let sessionProgress = dueProgress
    const seenCardIds = new Set(dueProgress.map((p) => p.cardId._id.toString()))

    // 2. If not enough due cards, add cards the user is still learning
    if (sessionProgress.length < sessionSize) {
      const learningProgress = await UserCardProgress.find({
        userId,
        cardId: { $nin: Array.from(seenCardIds) },
      })
        .sort({ repetitions: 1, nextReviewAt: 1 })
        .limit(sessionSize - sessionProgress.length)
        .populate<{ cardId: ICard }>('cardId')

      sessionProgress = [...sessionProgress, ...learningProgress]
      learningProgress.forEach((p) => seenCardIds.add(p.cardId._id.toString()))
    }

    // 3. If still not enough, add brand new cards the user has never seen
    if (sessionProgress.length < sessionSize) {
      const userDecks = await Deck.find({
        _id: { $in: await UserCardProgress.distinct('deckId', { userId }) },
      })
      const allUserCardIds = userDecks.flatMap((deck) => deck.cards)

      const newCards = await Card.find({
        _id: { $in: allUserCardIds, $nin: Array.from(seenCardIds) },
      }).limit(sessionSize - sessionProgress.length)

      const newProgress = newCards.map((card) => ({ cardId: card, repetitions: 0 }))
      sessionProgress = [...sessionProgress, ...(newProgress as any)]
    }

    const sessionQuestions = await Promise.all(
      sessionProgress.map((progress) => createQuestionData(progress.cardId, progress))
    )

    res.json({ cards: sessionQuestions })
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
