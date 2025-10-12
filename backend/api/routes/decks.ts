import { Router } from 'express'
import { Deck } from '../db/schema.ts'

const router = Router()

// create a new deck
router.post('/', async (req, res) => {
  try {
    const { name, description, ownerId } = req.body

    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Name and ownerId are required' })
    }

    const newDeck = new Deck({
      name,
      description,
      ownerId,
    })

    await newDeck.save()
    res.status(201).json(newDeck)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create deck' })
  }
})

router.get('/', async (_req, res) => {
  try {
    const allDecks = await Deck.find().populate('ownerId')

    const decksWithCount = allDecks.map((deck) => {
      const deckObject = deck.toObject()
      return {
        ...deckObject,
        cardCount: deck.cards.length,
        cards: [],
      }
    })

    res.json(decksWithCount)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch decks' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deck = await Deck.findById(id).populate('ownerId').populate('cards')

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' })
    }
    res.json(deck)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch deck' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const updatedDeck = await Deck.findByIdAndUpdate(id, { name, description }, { new: true })

    if (!updatedDeck) {
      return res.status(404).json({ error: 'Deck not found' })
    }
    res.json(updatedDeck)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update deck' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deletedDeck = await Deck.findByIdAndDelete(id)

    if (!deletedDeck) {
      return res.status(404).json({ error: 'Deck not found' })
    }
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete deck' })
  }
})

export default router
