import cors from 'cors'
import express from 'express'
import passport from 'passport'
import googleStrategy from './auth/googleStrategy.ts'
import jwtStrategy from './auth/jwtStrategy.ts'
import { validateEnvironment } from './config/env.ts'
import connectDB from './db/index.ts'
import logger from './logger.ts'
import { generalLimiter } from './middleware/rateLimiter.ts'
import authRouter from './routes/auth.ts'
import cardsRouter from './routes/cards.ts'
import decksRouter from './routes/decks.ts'
import healthRouter from './routes/health.ts'
import imageSearchRouter from './routes/imageSearch.ts'
import reviewRouter from './routes/review.ts'
import usersRouter from './routes/users.ts'

// Validate environment variables before starting
try {
  validateEnvironment()
  logger.info('Environment validation passed')
} catch (error) {
  logger.error(`Environment validation failed: ${error.message}`)
  process.exit(1)
}

try {
  connectDB()
} catch (error) {
  logger.error('Failed to start code')
  process.exit(1)
}

const PORT = process.env.PORT || 8000
const app = express()

app.set('trust proxy', 1)

// Apply general rate limiting to all routes
app.use(generalLimiter)

// CORS Configuration - whitelist allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : process.env.IS_DEV === 'true'
    ? ['http://localhost:8081', 'http://localhost:19006', 'exp://localhost:8081']
    : []

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    maxAge: 86400, // Cache preflight requests for 24 hours
  })
)
app.use(express.json())

// Request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.http(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`)
  })
  next()
})

app.use(passport.initialize())

passport.use(googleStrategy)
passport.use(jwtStrategy)

// Health checks (no auth required)
app.use('/health', healthRouter)

// API routes (auth required)
app.use('/auth', authRouter)
app.use('/cards', cardsRouter)
app.use('/decks', decksRouter)
app.use('/images', imageSearchRouter)
app.use('/review', reviewRouter)
app.use('/users', usersRouter)

app.get('/', (_req, res) => {
  res.send('Dudulingo API is running!')
})

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`)
})

/**
 * Graceful shutdown handler
 * Ensures all connections are closed properly before process exit
 */
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown`)

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed')

    try {
      // Close database connection
      await mongoose.connection.close()
      logger.info('Database connection closed')

      logger.info('Graceful shutdown completed successfully')
      process.exit(0)
    } catch (error) {
      logger.error('Error during graceful shutdown', { error })
      process.exit(1)
    }
  })

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded, forcing exit')
    process.exit(1)
  }, 30000) // 30 seconds timeout
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
