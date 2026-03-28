/**
 * Validation schemas for review endpoints
 */

import { z } from 'zod'

// Valid rating values from the SRS system
const ratingValues = ['very_hard', 'hard', 'medium', 'easy', 'very_easy'] as const

export const submitReviewSchema = z.object({
  body: z.object({
    cardId: z.string().length(24, 'Invalid card ID'),
    rating: z.enum(ratingValues, {
      errorMap: () => ({
        message: 'Rating must be one of: very_hard, hard, medium, easy, very_easy',
      }),
    }),
  }),
})

export const deckIdParamSchema = z.object({
  params: z.object({
    deckId: z.string().length(24, 'Invalid deck ID'),
  }),
})
