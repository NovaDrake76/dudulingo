import { Router } from 'express'
import passport from 'passport'
import jwtStrategy from '../auth/jwtStrategy.ts'
import { Card, Deck } from '../db/schema.ts'
import type { IUser } from '../db/schema.ts'
import logger from '../logger.ts'
import { verifyCardOwnership } from '../middleware/ownership.ts'
import { validate } from '../middleware/validation.ts'
import {
  cardIdParamSchema,
  createCardSchema,
  updateCardSchema,
} from '../schemas/card.schema.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

// create a new card
router.post('/', validate(createCardSchema), async (req, res) => {
  try {
    const { type, prompt, answer, imageUrl, lang, level, deckId } = req.body
    const userId = (req.user as IUser)._id

    if (!type || !answer) {
      return res.status(400).json({ error: 'Type and answer are required' })
    }

    // If deckId provided, verify ownership before adding card
    if (deckId) {
      const deck = await Deck.findById(deckId)
      if (!deck) {
        return res.status(404).json({ error: 'Deck not found' })
      }
      if (deck.ownerId.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Forbidden: You do not own this deck' })
      }
    }

    const newCard = new Card({
      type,
      prompt,
      answer,
      imageUrl,
      lang,
      level,
    })

    await newCard.save()

    if (deckId) {
      await Deck.findByIdAndUpdate(deckId, { $addToSet: { cards: newCard._id } })
    }

    res.status(201).json(newCard)
  } catch (err) {
    logger.error('Failed to create card', { error: err })
    res.status(500).json({ error: 'Failed to create card' })
  }
})

// Get all cards (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit

    const [cards, total] = await Promise.all([
      Card.find().skip(skip).limit(limit),
      Card.countDocuments(),
    ])

    res.json({ data: cards, total, page, limit })
  } catch (err) {
    logger.error('Failed to fetch cards', { error: err })
    res.status(500).json({ error: 'Failed to fetch cards' })
  }
})

router.get('/:id', validate(cardIdParamSchema), async (req, res) => {
  try {
    const { id } = req.params
    const card = await Card.findById(id)

    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }
    res.json(card)
  } catch (err) {
    logger.error('Failed to fetch card', { error: err })
    res.status(500).json({ error: 'Failed to fetch card' })
  }
})

router.put('/:id', validate(updateCardSchema), verifyCardOwnership, async (req, res) => {
  try {
    const { id } = req.params
    const { prompt, answer, imageUrl, lang } = req.body

    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { prompt, answer, imageUrl, lang },
      { new: true }
    )

    // Card existence and ownership already verified by middleware
    res.json(updatedCard)
  } catch (err) {
    logger.error('Failed to update card', { error: err })
    res.status(500).json({ error: 'Failed to update card' })
  }
})

router.delete('/:id', validate(cardIdParamSchema), verifyCardOwnership, async (req, res) => {
  try {
    const { id } = req.params

    const deletedCard = await Card.findByIdAndDelete(id)

    // Card existence and ownership already verified by middleware

    // also remove the card reference from any decks
    await Deck.updateMany({ cards: id }, { $pull: { cards: id } })

    res.status(204).send()
  } catch (err) {
    logger.error('Failed to delete card', { error: err })
    res.status(500).json({ error: 'Failed to delete card' })
  }
})

export default router
