/**
 * Ownership verification middleware
 * Ensures users can only access and modify their own resources
 */

import type { NextFunction, Request, Response } from 'express'
import { Card, Deck } from '../db/schema.ts'
import type { IUser } from '../db/schema.ts'

/**
 * Verify that the user owns the deck specified in req.params.id
 */
export async function verifyDeckOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params
    const userId = (req.user as IUser)._id

    const deck = await Deck.findById(id)

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' })
    }

    if (deck.ownerId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: 'Forbidden: You do not own this deck' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Verify that the user owns the card specified in req.params.id
 * Also checks deck ownership transitively
 */
export async function verifyCardOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params
    const userId = (req.user as IUser)._id

    const card = await Card.findById(id)

    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }

    // Check deck ownership
    const deck = await Deck.findById(card.deckId)

    if (!deck) {
      return res.status(404).json({ error: 'Associated deck not found' })
    }

    if (deck.ownerId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: 'Forbidden: You do not own this card' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
