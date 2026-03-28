/**
 * Validation schemas for deck endpoints
 */

import { z } from 'zod'

export const createDeckSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Deck name is required')
      .max(100, 'Deck name must be less than 100 characters'),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .optional(),
  }),
})

export const updateDeckSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid deck ID'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Deck name cannot be empty')
      .max(100, 'Deck name must be less than 100 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .optional(),
  }),
})

export const deckIdParamSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid deck ID'),
  }),
})

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .optional(),
  }),
})
