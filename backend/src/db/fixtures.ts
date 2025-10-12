import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { v4 as uuidv4 } from 'uuid'
import * as schema from './schema.ts'

const USER_ID_JOSE = '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d'
const USER_ID_ALICE = 'f1e2d3c4-b5a6-7f8e-9d0c-b1a2e3f4d5c6'

const DECK_ID_ANIMALS = 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6'

const CARD_ID_DOG = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
const CARD_ID_CAT = 'f47ac10b-58cc-4372-a567-0e02b2c3d480'
const CARD_ID_LION = 'f47ac10b-58cc-4372-a567-0e02b2c3d481'
const CARD_ID_TIGER = 'f47ac10b-58cc-4372-a567-0e02b2c3d482'

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
    id: DECK_ID_ANIMALS,
    name: 'Animals',
    description: 'A collection of common animals.',
    ownerId: USER_ID_JOSE,
  },
]

export const cards = [
  {
    id: CARD_ID_DOG,
    type: 'basic',
    level: 1,
  },
  {
    id: CARD_ID_CAT,
    type: 'basic',
    level: 1,
  },
  {
    id: CARD_ID_LION,
    type: 'basic',
    level: 1,
  },
  {
    id: CARD_ID_TIGER,
    type: 'basic',
    level: 1,
  },
]

export const cardContents = [
  {
    id: uuidv4(),
    cardId: CARD_ID_DOG,
    prompt: 'Dog',
    answer: 'Cachorro',
    lang: 'en',
    imageUrl: 'https://i.imgur.com/al5h69r.jpeg',
  },
  {
    id: uuidv4(),
    cardId: CARD_ID_CAT,
    prompt: 'Cat',
    answer: 'Gato',
    lang: 'en',
    imageUrl: 'https://i.imgur.com/5i1qA4a.jpeg',
  },
  {
    id: uuidv4(),
    cardId: CARD_ID_LION,
    prompt: 'Lion',
    answer: 'Leão',
    lang: 'en',
    imageUrl: 'https://i.imgur.com/B1Yw33p.jpeg',
  },
  {
    id: uuidv4(),
    cardId: CARD_ID_TIGER,
    prompt: 'Tiger',
    answer: 'Tigre',
    lang: 'en',
    imageUrl: 'https://i.imgur.com/xT425vj.jpeg',
  },
]

export const deckCards = [
  { deckId: DECK_ID_ANIMALS, cardId: CARD_ID_DOG },
  { deckId: DECK_ID_ANIMALS, cardId: CARD_ID_CAT },
  { deckId: DECK_ID_ANIMALS, cardId: CARD_ID_LION },
  { deckId: DECK_ID_ANIMALS, cardId: CARD_ID_TIGER },
]

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const now = new Date()

export const userCardProgress = [
  {
    userId: USER_ID_JOSE,
    cardId: CARD_ID_DOG,
    easeFactor: '2.6',
    interval: 5,
    repetitions: 3,
    nextReviewAt: addDays(now, 5),
  },
]

export async function seed(db: NodePgDatabase<typeof schema>) {
  console.log('Seeding database...')

  console.log('Clearing existing data...')
  await db.delete(schema.userCardProgress)
  await db.delete(schema.deckCards)
  await db.delete(schema.cardContents)
  await db.delete(schema.cards)
  await db.delete(schema.decks)
  await db.delete(schema.users)

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
