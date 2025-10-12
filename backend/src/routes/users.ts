import { eq } from 'drizzle-orm'
import { Router } from 'express'
import passport from 'passport'
import jwtStrategy from '../auth/jwtStrategy.ts'
import { db } from '../db/index.ts'
import { deckCards, userCardProgress, users } from '../db/schema.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

// save user's selected language
router.post('/language', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { language } = req.body

    if (!language) {
      return res.status(400).json({ error: 'Language is required' })
    }

    const [updatedUser] = await db
      .update(users)
      .set({ selectedLanguage: language })
      .where(eq(users.id, userId))
      .returning()

    res.json({ message: 'Language saved successfully', user: updatedUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save language' })
  }
})

// add deck to user's learning list
router.post('/decks/:deckId', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { deckId } = req.params

    const cardsInDeck = await db.query.deckCards.findMany({
      where: eq(deckCards.deckId, deckId),
    })

    if (!cardsInDeck || cardsInDeck.length === 0) {
      return res.status(404).json({ error: 'Deck not found or has no cards' })
    }

    // add all cards to user's progress with initial values
    const progressEntries = cardsInDeck.map((dc) => ({
      userId,
      cardId: dc.cardId,
      easeFactor: '2.5',
      interval: 0,
      repetitions: 0,
      nextReviewAt: new Date(),
    }))

    await db.insert(userCardProgress).values(progressEntries).onConflictDoNothing()

    res.json({
      message: 'Deck added successfully',
      cardsAdded: progressEntries.length,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add deck' })
  }
})

// get user stats
router.get('/stats', async (req: any, res) => {
  try {
    const userId = req.user.id

    const allProgress = await db.query.userCardProgress.findMany({
      where: eq(userCardProgress.userId, userId),
    })

    const totalWords = allProgress.length
    const masteredWords = allProgress.filter((p) => p.repetitions >= 5).length
    const learningWords = totalWords - masteredWords

    res.json({
      totalWords,
      masteredWords,
      learningWords,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
