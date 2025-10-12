import { Router } from 'express'
import passport from 'passport'
import jwtStrategy from '../auth/jwtStrategy.ts'
import type { ICard } from '../db/schema.ts'
import { Deck, User, UserCardProgress } from '../db/schema.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

router.get('/me', (req: any, res) => {
  res.json(req.user)
})


router.post('/language', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { language } = req.body

    if (!language) {
      return res.status(400).json({ error: 'Language is required' })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { selectedLanguage: language },
      { new: true }
    )

    res.json({ message: 'Language saved successfully', user: updatedUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save language' })
  }
})

// add a deck's cards to a user's learning list
router.post('/decks/:deckId', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { deckId } = req.params

    const deck = await Deck.findById(deckId)

    if (!deck || deck.cards.length === 0) {
      return res.status(404).json({ error: 'Deck not found or has no cards' })
    }

    // prepare progress entries for all cards in the deck
    const progressEntries = deck.cards.map((cardId: ICard['_id']) => ({
      userId,
      cardId,
      deckId,
    }))

    await UserCardProgress.insertMany(progressEntries, { ordered: false }).catch((err) => {
      // ignore duplicate key errors, which are expected if some cards are already added
      if (err.code !== 11000) {
        throw err
      }
    })

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

    const allProgress = await UserCardProgress.find({ userId })

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
