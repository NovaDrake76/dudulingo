/**
 * Migration runner
 * Executes database migrations in order
 */

import mongoose from 'mongoose'
import connectDB from '../api/db/index.ts'
import logger from '../api/logger.ts'

// Import migrations
import * as migration000 from '../migrations/000-initial-schema.ts'

const migrations = [
  { id: '000-initial-schema', ...migration000 },
]

async function runMigrations() {
  try {
    // Connect to database
    await connectDB()
    logger.info('Connected to database for migrations')

    // Check which migrations have been run
    // In a production app, you'd track this in a migrations collection
    // For now, we'll just run all migrations

    for (const migration of migrations) {
      logger.info(`Running migration: ${migration.id}`)
      await migration.up()
    }

    logger.info('All migrations completed successfully')
  } catch (error) {
    logger.error('Migration failed', { error })
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    logger.info('Database connection closed')
  }
}

// Run migrations
runMigrations()
