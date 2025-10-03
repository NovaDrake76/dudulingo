import { Router } from 'express'
import { db } from '../db/index.ts'
import { cards, cardContents, deckCards } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { type, prompt, answer, options, deckId } = req.body

    if (!type || !prompt || !answer) {
      return res.status(400).json({ error: 'type, prompt, and answer are required' })
    }

    const newCard = await db.transaction(async (tx) => {
      const [card] = await tx.insert(cards).values({ type }).returning()

      await tx.insert(cardContents).values({
        cardId: card.id,
        prompt,
        answer,
        options: options ? JSON.stringify(options) : null,
      })

      if (deckId) {
        await tx.insert(deckCards).values({
          deckId,
          cardId: card.id,
        })
      }

      const result = await tx.query.cards.findFirst({
        where: eq(cards.id, card.id),
        with: {
          contents: true,
          deckCards: { with: { deck: true } },
        },
      })

      return result
    })

    res.status(201).json(newCard)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create card' })
  }
})

router.get('/', async (_req, res) => {
  try {
    const allCards = await db.query.cards.findMany({
      with: {
        contents: true,
        deckCards: {
          with: {
            deck: true,
          },
        },
      },
    })
    res.json(allCards)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch cards' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const card = await db.query.cards.findFirst({
      where: (c, { eq }) => eq(c.id, id),
      with: {
        contents: true,
        deckCards: {
          with: {
            deck: true,
          },
        },
      },
    })

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
    const { prompt, answer, options } = req.body

    const [updatedContent] = await db
      .update(cardContents)
      .set({
        prompt,
        answer,
        options: options ? JSON.stringify(options) : null,
      })
      .where(eq(cardContents.cardId, id))
      .returning()

    if (!updatedContent) {
      return res.status(404).json({ error: 'Card or its content not found' })
    }

    const updatedCard = await db.query.cards.findFirst({
      where: eq(cards.id, id),
      with: { contents: true, deckCards: { with: { deck: true } } },
    })

    res.json(updatedCard)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update card' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [deleted] = await db.transaction(async (tx) => {
      await tx.delete(deckCards).where(eq(deckCards.cardId, id))
      await tx.delete(cardContents).where(eq(cardContents.cardId, id))
      return tx.delete(cards).where(eq(cards.id, id)).returning()
    })

    if (!deleted) {
      return res.status(404).json({ error: 'Card not found' })
    }

    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete card' })
  }
})

export default router
