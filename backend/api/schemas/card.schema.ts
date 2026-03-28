/**
 * Validation schemas for card endpoints
 */

import { z } from 'zod'

// Valid card types from the schema
const cardTypes = [
  'selection_mc',
  'type_answer',
  'image_and_word_to_translation_mc',
  'image_to_word_mc',
  'word_to_translation_mc',
  'word_to_image_mc',
  'image_to_type_answer',
  'translation_to_type_answer',
] as const

export const createCardSchema = z.object({
  body: z.object({
    type: z.enum(cardTypes, {
      errorMap: () => ({ message: 'Invalid card type' }),
    }),
    prompt: z
      .string()
      .min(1, 'Prompt is required')
      .max(500, 'Prompt must be less than 500 characters')
      .optional(),
    answer: z
      .string()
      .min(1, 'Answer is required')
      .max(500, 'Answer must be less than 500 characters'),
    imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
    audioUrl: z.string().url('Invalid audio URL').optional().or(z.literal('')),
    lang: z
      .string()
      .length(2, 'Language code must be 2 characters (ISO 639-1)')
      .optional(),
    level: z.number().int().min(1).max(10).optional(),
    deckId: z.string().optional(),
  }),
})

export const updateCardSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid card ID'),
  }),
  body: z.object({
    prompt: z
      .string()
      .min(1, 'Prompt cannot be empty')
      .max(500, 'Prompt must be less than 500 characters')
      .optional(),
    answer: z
      .string()
      .min(1, 'Answer cannot be empty')
      .max(500, 'Answer must be less than 500 characters')
      .optional(),
    imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
    lang: z
      .string()
      .length(2, 'Language code must be 2 characters (ISO 639-1)')
      .optional(),
  }),
})

export const cardIdParamSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid card ID'),
  }),
})
