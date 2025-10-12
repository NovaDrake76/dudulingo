import { Router } from 'express'
import { Card, Deck } from '../db/schema.ts'

const router = Router()

// create a new card
router.post('/', async (req, res) => {
  try {
    const { type, prompt, answer, imageUrl, lang, level, deckId } = req.body

    if (!type || !answer) {
      return res.status(400).json({ error: 'Type and answer are required' })
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
    console.error(err)
    res.status(500).json({ error: 'Failed to create card' })
  }
})

// Get all cards
router.get('/', async (_req, res) => {
  try {
    const allCards = await Card.find()
    res.json(allCards)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch cards' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const card = await Card.findById(id)

    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }
    res.json(card)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch card' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { prompt, answer, imageUrl, lang } = req.body

    const updatedCard = await Card.findByIdAndUpdate(
      id,
      { prompt, answer, imageUrl, lang },
      { new: true }
    )

    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' })
    }

    res.json(updatedCard)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update card' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const deletedCard = await Card.findByIdAndDelete(id)

    if (!deletedCard) {
      return res.status(404).json({ error: 'Card not found' })
    }

    // also remove the card reference from any decks
    await Deck.updateMany({ cards: id }, { $pull: { cards: id } })

    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete card' })
  }
})

export default router
