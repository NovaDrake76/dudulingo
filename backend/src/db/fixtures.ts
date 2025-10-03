import { v4 as uuidv4 } from 'uuid' // You might need to run: npm install uuid && npm install -D @types/uuid
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema.ts' // Assuming your schema file is named schema.ts

// --- Reusable IDs for consistency ---
const USER_ID_JOSE = '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d'
const USER_ID_ALICE = 'f1e2d3c4-b5a6-7f8e-9d0c-b1a2e3f4d5c6'

const DECK_ID_COMPILERS = 'c1d2e3f4-a5b6-7c8d-9e0f-a1b2c3d4e5f6'
const DECK_ID_PATTERNS = 'd2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a'

const CARD_ID_PEG = '10000000-0000-0000-0000-000000000001'
const CARD_ID_FIRST_FOLLOW = '10000000-0000-0000-0000-000000000002'
const CARD_ID_SINGLETON = '20000000-0000-0000-0000-000000000001'
const CARD_ID_FACTORY = '20000000-0000-0000-0000-000000000002'
const CARD_ID_CLOSURE = '30000000-0000-0000-0000-000000000001'

// --- Fixture Data ---

export const users = [
  {
    id: USER_ID_JOSE,
    name: 'José Eduardo',
    providerId: 'github|12345',
    photoUrl: 'https://example.com/jose.png',
  },
  {
    id: USER_ID_ALICE,
    name: 'Alice Smith',
    providerId: 'google|67890',
    photoUrl: 'https://example.com/alice.png',
  },
]

export const decks = [
  {
    id: DECK_ID_COMPILERS,
    name: 'Compiler Theory Basics',
    description: 'Fundamentals of compiler design, including parsing and grammars.',
    ownerId: USER_ID_JOSE,
  },
  {
    id: DECK_ID_PATTERNS,
    name: 'GoF Design Patterns',
    description: 'Classic Gang of Four design patterns in Java.',
    ownerId: USER_ID_JOSE,
  },
]

export const cards = [
  {
    id: CARD_ID_PEG,
    type: 'basic',
    level: 1, // Drizzle will handle the serial default, but it can be specified
  },
  {
    id: CARD_ID_FIRST_FOLLOW,
    type: 'basic',
    level: 2,
  },
  {
    id: CARD_ID_SINGLETON,
    type: 'basic',
    level: 3,
  },
  {
    id: CARD_ID_FACTORY,
    type: 'fill-in-the-blank',
    level: 4,
  },
  {
    id: CARD_ID_CLOSURE,
    type: 'multiple-choice',
    level: 5,
  },
]

export const cardContents = [
  // Contents for PEG card
  {
    id: uuidv4(),
    cardId: CARD_ID_PEG,
    prompt: 'What does PEG stand for in parsing theory?',
    answer: 'Parsing Expression Grammar',
    lang: 'en',
  },
  // Contents for FIRST/FOLLOW card
  {
    id: uuidv4(),
    cardId: CARD_ID_FIRST_FOLLOW,
    prompt: 'What is the primary purpose of calculating FIRST and FOLLOW sets?',
    answer:
      'To construct predictive parsing tables (e.g., for LL(1) parsers) by resolving which production to use without backtracking.',
    lang: 'en',
  },
  // Contents for Singleton card
  {
    id: uuidv4(),
    cardId: CARD_ID_SINGLETON,
    prompt:
      'Which design pattern ensures a class only has one instance and provides a global point of access to it?',
    answer: 'The Singleton Pattern.',
    lang: 'en',
  },
  // Contents for Factory card (Fill-in-the-blank)
  {
    id: uuidv4(),
    cardId: CARD_ID_FACTORY,
    prompt:
      'The ___ pattern provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.',
    answer: 'Factory Method',
    lang: 'en',
  },
  // Contents for Closure card (Multiple-choice) - Answer stored in `answer`, choices in `prompt` as JSON
  {
    id: uuidv4(),
    cardId: CARD_ID_CLOSURE,
    prompt: JSON.stringify({
      question: 'In JavaScript, what is a closure?',
      options: [
        'A function having access to the parent scope, even after the parent function has closed.',
        'A special type of class that cannot be instantiated.',
        'A way to lock variables to prevent them from being changed.',
        'A built-in method for closing file streams.',
      ],
    }),
    answer:
      'A function having access to the parent scope, even after the parent function has closed.',
    lang: 'en',
  },
]

export const deckCards = [
  // Compiler Deck
  { deckId: DECK_ID_COMPILERS, cardId: CARD_ID_PEG },
  { deckId: DECK_ID_COMPILERS, cardId: CARD_ID_FIRST_FOLLOW },

  // Design Patterns Deck
  { deckId: DECK_ID_PATTERNS, cardId: CARD_ID_SINGLETON },
  { deckId: DECK_ID_PATTERNS, cardId: CARD_ID_FACTORY },

  // The closure card is not in any deck yet
]

// Helper to calculate future dates
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const now = new Date()

export const userCardProgress = [
  // José's progress
  {
    userId: USER_ID_JOSE,
    cardId: CARD_ID_PEG,
    easeFactor: '2.6',
    interval: 5,
    repetitions: 3,
    nextReviewAt: addDays(now, 5), // Due in 5 days
  },
  {
    userId: USER_ID_JOSE,
    cardId: CARD_ID_FIRST_FOLLOW,
    easeFactor: '2.5',
    interval: 0,
    repetitions: 0,
    nextReviewAt: now, // Due now (new card)
  },
  {
    userId: USER_ID_JOSE,
    cardId: CARD_ID_SINGLETON,
    easeFactor: '1.9', // User found this difficult
    interval: 1,
    repetitions: 2,
    nextReviewAt: addDays(now, -1), // Overdue by 1 day
  },
  // Alice has no progress yet
]

/**
 * A seeding function to populate the database.
 * @param db The Drizzle database instance.
 */
export async function seed(db: NodePgDatabase<typeof schema>) {
  console.log('Seeding database...')

  // Clear existing data in reverse order of dependencies
  console.log('Clearing existing data...')
  await db.delete(schema.userCardProgress)
  await db.delete(schema.deckCards)
  await db.delete(schema.cardContents)
  await db.delete(schema.cards)
  await db.delete(schema.decks)
  await db.delete(schema.users)

  // Insert new data in the correct order of dependencies
  console.log('Inserting users...')
  await db.insert(schema.users).values(users)

  console.log('Inserting decks...')
  await db.insert(schema.decks).values(decks)

  console.log('Inserting cards...')
  await db.insert(schema.cards).values(cards)

  console.log('Inserting card contents...')
  await db.insert(schema.cardContents).values(cardContents)

  console.log('Linking cards to decks...')
  await db.insert(schema.deckCards).values(deckCards)

  console.log('Inserting user card progress...')
  await db.insert(schema.userCardProgress).values(userCardProgress)

  console.log('Seeding complete!')
}
