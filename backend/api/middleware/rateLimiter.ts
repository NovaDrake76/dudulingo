/**
 * Rate limiting middleware to prevent abuse
 * Configured with different limits for different endpoint types
 */

import rateLimit from 'express-rate-limit'

/**
 * General rate limiter for most endpoints
 * 100 requests per 15 minutes per IP
 * Disabled in development mode
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => process.env.IS_DEV === 'true', // Skip in development
})

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 * Only counts failed requests (skipSuccessfulRequests)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed auth attempts
})

/**
 * Review session rate limiter
 * 10 sessions per minute per IP
 * Prevents rapid-fire review creation
 * Disabled in development mode
 */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: 'Too many review sessions created, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.IS_DEV === 'true', // Skip in development
})
