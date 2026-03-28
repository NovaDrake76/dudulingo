/**
 * Request validation middleware using Zod schemas
 */

import type { NextFunction, Request, Response } from 'express'
import type { AnyZodObject, ZodError } from 'zod'

/**
 * Validates request body, query, and params against a Zod schema
 * Returns 400 with detailed error messages on validation failure
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      const zodError = error as ZodError
      return res.status(400).json({
        error: 'Validation failed',
        details: zodError.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      })
    }
  }
}
