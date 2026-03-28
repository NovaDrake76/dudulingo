/**
 * Initial schema migration
 * Creates indexes for optimal query performance
 */

import { Card, Deck, User, UserCardProgress } from '../api/db/schema.ts'
import logger from '../api/logger.ts'

export async function up() {
  logger.info('Running migration: 000-initial-schema')

  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true })
    await User.collection.createIndex({ providerId: 1 }, { unique: true })
    logger.info('Created User indexes')

    // Deck indexes
    await Deck.collection.createIndex({ ownerId: 1 })
    await Deck.collection.createIndex({ name: 1, ownerId: 1 })
    logger.info('Created Deck indexes')

    // Card indexes
    await Card.collection.createIndex({ deckId: 1 })
    await Card.collection.createIndex({ type: 1 })
    logger.info('Created Card indexes')

    // UserCardProgress indexes
    await UserCardProgress.collection.createIndex({ userId: 1, cardId: 1 }, { unique: true })
    await UserCardProgress.collection.createIndex({ userId: 1, nextReviewAt: 1 })
    await UserCardProgress.collection.createIndex({ deckId: 1 })
    logger.info('Created UserCardProgress indexes')

    logger.info('Migration 000-initial-schema completed successfully')
  } catch (error) {
    logger.error('Migration 000-initial-schema failed', { error })
    throw error
  }
}

export async function down() {
  logger.info('Rolling back migration: 000-initial-schema')

  try {
    // Drop all indexes (except _id which is automatic)
    await User.collection.dropIndexes()
    await Deck.collection.dropIndexes()
    await Card.collection.dropIndexes()
    await UserCardProgress.collection.dropIndexes()

    logger.info('Rollback 000-initial-schema completed successfully')
  } catch (error) {
    logger.error('Rollback 000-initial-schema failed', { error })
    throw error
  }
}
