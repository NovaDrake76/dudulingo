import { Router } from 'express'
import { db } from '../db/index.ts'
import { decks } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { name, description, ownerId } = req.body

    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Name and ownerId are required' })
    }

    const [deck] = await db
      .insert(decks)
      .values({
        name,
        description,
        ownerId,
      })
      .returning()

    res.status(201).json(deck)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create deck' })
  }
})

router.get('/', async (_req, res) => {
  try {
    const allDecks = await db.query.decks.findMany({
      with: {
        owner: true,
        deckCards: {
          with: {
            card: {
              with: {
                contents: true,
              },
            },
          },
        },
      },
    })
    res.json(allDecks)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch decks' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const deck = await db.query.decks.findFirst({
      where: eq(decks.id, id),
      with: {
        owner: true,
        deckCards: {
          with: {
            card: {
              with: {
                contents: true,
              },
            },
          },
        },
      },
    })

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

    const [updated] = await db
      .update(decks)
      .set({ name, description })
      .where(eq(decks.id, id))
      .returning()

    if (!updated) {
      return res.status(404).json({ error: 'Deck not found' })
    }
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update deck' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [deleted] = await db.delete(decks).where(eq(decks.id, id)).returning()

    if (!deleted) {
      return res.status(404).json({ error: 'Deck not found' })
    }
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete deck' })
  }
})

export default router
