import { and, eq, lte } from 'drizzle-orm'
import { Router } from 'express'
import passport from 'passport'
import jwtStrategy from '../auth/jwtStrategy.ts'
import { db } from '../db/index.ts'
import { cards, deckCards, userCardProgress } from '../db/schema.ts'
import { calculateSrs } from '../srs.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

// determine question type based on knowledge level (repetitions)
const getQuestionType = (repetitions: number): string => {
  if (repetitions === 0) {
    return 'image_word_multiple_choice' // easiest: show image + word, choose translation
  } else if (repetitions === 1) {
    return 'image_multiple_choice' // show only image, choose word in foreign language
  } else if (repetitions === 2) {
    return 'word_translation_multiple_choice' // show word, choose translation
  } else if (repetitions === 3) {
    return 'translation_image_multiple_choice' // show translation, choose correct image
  } else if (repetitions === 4) {
    return 'image_type_answer' // show image, type the word
  } else {
    return 'word_multiple_choice_image' // show word, choose correct image
  }
}

// get options for multiple choice from same deck
const getMultipleChoiceOptions = async (cardId: string, deckId: string, correctAnswer: string) => {
  // find the deck this card belongs to
  const cardsFromSameDeck = await db.query.deckCards.findMany({
    where: eq(deckCards.deckId, deckId),
    with: {
      card: {
        with: {
          contents: true,
        },
      },
    },
  })

  // filter out the correct answer and get 3 random wrong options
  const wrongOptions = cardsFromSameDeck
    .filter((dc) => dc.card.id !== cardId && dc.card.contents[0]?.answer !== correctAnswer)
    .map((dc) => dc.card.contents[0])
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  return wrongOptions
}

router.get('/next', async (req, res) => {
  try {
    const user = req.user as any

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const userId = user.id

    let nextCard
    let userProgress

    // 1. Prioritize cards that are currently due
    const dueCardProgress = await db.query.userCardProgress.findFirst({
      where: and(
        eq(userCardProgress.userId, userId),
        lte(userCardProgress.nextReviewAt, new Date())
      ),
      orderBy: (progress, { asc }) => [asc(progress.nextReviewAt)],
    })

    if (dueCardProgress) {
      userProgress = dueCardProgress
      nextCard = await db.query.cards.findFirst({
        where: eq(cards.id, dueCardProgress.cardId),
        with: { contents: true, deckCards: { with: { deck: true } } },
      })
    } else {
      // 2. If no cards are due, find a new, unseen card
      const newCardResult = await db.query.cards.findFirst({
        with: {
          contents: true,
          deckCards: { with: { deck: true } },
        },
        where: (cards, { notExists }) =>
          notExists(
            db
              .select()
              .from(userCardProgress)
              .where(
                and(eq(userCardProgress.cardId, cards.id), eq(userCardProgress.userId, userId))
              )
          ),
      })

      if (newCardResult) {
        nextCard = newCardResult
        userProgress = {
          userId,
          cardId: newCardResult.id,
          easeFactor: '2.5',
          interval: 0,
          repetitions: 0,
          nextReviewAt: new Date(),
        }
      } else {
        // 3. If no cards are due and no new cards, get the least recently reviewed card
        const leastRecentProgress = await db.query.userCardProgress.findFirst({
          where: eq(userCardProgress.userId, userId),
          orderBy: (progress, { asc }) => [asc(progress.nextReviewAt)],
        })

        if (leastRecentProgress) {
          userProgress = leastRecentProgress
          nextCard = await db.query.cards.findFirst({
            where: eq(cards.id, leastRecentProgress.cardId),
            with: { contents: true, deckCards: { with: { deck: true } } },
          })
        }
      }
    }

    if (!nextCard) {
      return res.status(200).json({ message: "You've reviewed all cards for now!" })
    }

    const questionType = getQuestionType(userProgress.repetitions)
    const cardContent = nextCard.contents[0]
    const deckId = nextCard.deckCards[0]?.deckId

    const questionData: any = {
      cardId: nextCard.id,
      questionType,
      correctAnswer: cardContent.answer,
    }

    // add appropriate data based on question type
    if (questionType.includes('image')) {
      questionData.imageUrl = cardContent.imageUrl
    }

    if (questionType.includes('word')) {
      questionData.word = cardContent.answer
    }

    if (questionType.includes('translation')) {
      questionData.prompt = cardContent.prompt
    }

    // add multiple choice options if needed
    if (questionType.includes('multiple_choice')) {
      const wrongOptions = await getMultipleChoiceOptions(nextCard.id, deckId, cardContent.answer)
      const allOptions = [cardContent, ...wrongOptions].sort(() => Math.random() - 0.5)

      if (questionType.includes('image')) {
        questionData.options = allOptions.map((opt) => ({
          text: opt.answer,
          imageUrl: opt.imageUrl,
        }))
      } else {
        questionData.options = allOptions.map((opt) => opt.answer)
      }
    }

    res.json(questionData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch next review card' })
  }
})

router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { cardId, rating } = req.body

    if (!cardId || rating === undefined) {
      return res.status(400).json({ error: 'cardId and rating are required' })
    }

    let currentProgress = await db.query.userCardProgress.findFirst({
      where: and(eq(userCardProgress.userId, userId), eq(userCardProgress.cardId, cardId)),
    })

    if (!currentProgress) {
      currentProgress = {
        userId,
        cardId,
        easeFactor: '2.5',
        interval: 0,
        repetitions: 0,
        nextReviewAt: new Date(),
      }
    }

    const newProgress = calculateSrs(
      {
        repetitions: currentProgress.repetitions,
        easeFactor: parseFloat(currentProgress.easeFactor),
        interval: currentProgress.interval,
      },
      rating
    )

    await db
      .insert(userCardProgress)
      .values({ userId, cardId, ...newProgress })
      .onConflictDoUpdate({
        target: [userCardProgress.userId, userCardProgress.cardId],
        set: {
          ...newProgress,
        },
      })

    res.status(200).json({ message: 'Progress updated successfully', newProgress })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

// get review session for a specific deck
router.get('/deck/:deckId', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { deckId } = req.params

    // get all cards from deck that user hasn't mastered
    const cardsInDeck = await db.query.deckCards.findMany({
      where: eq(deckCards.deckId, deckId),
      with: {
        card: {
          with: {
            contents: true,
          },
        },
      },
    })

    // get user progress for these cards
    const cardIds = cardsInDeck.map((dc) => dc.cardId)
    const progressRecords = await db.query.userCardProgress.findMany({
      where: and(eq(userCardProgress.userId, userId)),
    })

    const progressMap = new Map(progressRecords.map((p) => [p.cardId, p]))

    // filter cards that need review (not mastered)
    const cardsNeedingReview = cardsInDeck
      .filter((dc) => {
        const progress = progressMap.get(dc.cardId)
        return !progress || progress.repetitions < 5 // not mastered
      })
      .slice(0, 10) // limit to 10 cards per session

    res.json({
      deckId,
      cardsInSession: cardsNeedingReview.length,
      cards: cardsNeedingReview.map((dc) => ({
        id: dc.card.id,
        content: dc.card.contents[0],
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create review session' })
  }
})

export default router
