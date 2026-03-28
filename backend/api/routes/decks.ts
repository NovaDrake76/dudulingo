import { Router } from 'express'
import passport from 'passport'
import jwtStrategy from '../auth/jwtStrategy.ts'
import type { IUser } from '../db/schema.ts'
import { Deck } from '../db/schema.ts'
import logger from '../logger.ts'
import { verifyDeckOwnership } from '../middleware/ownership.ts'
import { validate } from '../middleware/validation.ts'
import {
  createDeckSchema,
  deckIdParamSchema,
  paginationQuerySchema,
  updateDeckSchema,
} from '../schemas/deck.schema.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

// create a new deck
router.post('/', validate(createDeckSchema), async (req: any, res) => {
  try {
    const { name, description } = req.body
    const ownerId = (req.user as IUser)._id

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const newDeck = new Deck({
      name,
      description,
      ownerId,
    })

    await newDeck.save()
    res.status(201).json(newDeck)
  } catch (err) {
    logger.error('Failed to create deck', { error: err })
    res.status(500).json({ error: 'Failed to create deck' })
  }
})

router.get('/', validate(paginationQuerySchema), async (req, res) => {
  try {
    const userId = (req.user as IUser)._id
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit

    // Filter decks by ownership - users only see their own decks
    const [allDecks, total] = await Promise.all([
      Deck.find({ ownerId: userId }).populate('ownerId').skip(skip).limit(limit),
      Deck.countDocuments({ ownerId: userId }),
    ])

    const decksWithCount = allDecks.map((deck) => {
      const deckObject = deck.toObject()
      return {
        ...deckObject,
        cardCount: deck.cards.length,
        cards: [],
      }
    })

    res.json({ data: decksWithCount, total, page, limit })
  } catch (err) {
    logger.error('Failed to fetch decks', { error: err })
    res.status(500).json({ error: 'Failed to fetch decks' })
  }
})

router.get('/:id', validate(deckIdParamSchema), verifyDeckOwnership, async (req, res) => {
  try {
    const { id } = req.params
    const deck = await Deck.findById(id).populate('ownerId').populate('cards')

    // Deck existence and ownership already verified by middleware
    res.json(deck)
  } catch (err) {
    logger.error('Failed to fetch deck', { error: err })
    res.status(500).json({ error: 'Failed to fetch deck' })
  }
})

router.put('/:id', validate(updateDeckSchema), verifyDeckOwnership, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const updatedDeck = await Deck.findByIdAndUpdate(id, { name, description }, { new: true })

    // Deck existence and ownership already verified by middleware
    res.json(updatedDeck)
  } catch (err) {
    logger.error('Failed to update deck', { error: err })
    res.status(500).json({ error: 'Failed to update deck' })
  }
})

router.delete('/:id', validate(deckIdParamSchema), verifyDeckOwnership, async (req, res) => {
  try {
    const { id } = req.params
    const deletedDeck = await Deck.findByIdAndDelete(id)

    // Deck existence and ownership already verified by middleware
    res.status(204).send()
  } catch (err) {
    logger.error('Failed to delete deck', { error: err })
    res.status(500).json({ error: 'Failed to delete deck' })
  }
})

export default router
