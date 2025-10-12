import { relations } from 'drizzle-orm'
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const cardTypeEnum = pgEnum('card_type', ['basic', 'multiple-choice', 'fill-in-the-blank'])

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    providerId: text('provider_id').notNull(),
    photoUrl: text('photo_url'),
    selectedLanguage: text('selected_language'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    providerIdx: uniqueIndex('users_provider_id_idx').on(table.providerId),
  })
)

export const decks = pgTable('decks', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: uuid('owner_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// relationship table for users and their selected decks
export const userDecks = pgTable(
  'user_decks',
  {
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    deckId: uuid('deck_id')
      .references(() => decks.id)
      .notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.deckId] }),
  })
)

export const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: cardTypeEnum('type').notNull(),
  level: serial('level'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const cardContents = pgTable('card_contents', {
  id: uuid('id').defaultRandom().primaryKey(),
  cardId: uuid('card_id')
    .references(() => cards.id)
    .notNull(),
  imageUrl: text('imageUrl'),
  prompt: text('prompt'),
  answer: text('answer').notNull(),
  lang: text('lang'),
})

export const deckCards = pgTable(
  'deck_cards',
  {
    deckId: uuid('deck_id')
      .references(() => decks.id)
      .notNull(),
    cardId: uuid('card_id')
      .references(() => cards.id)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.deckId, t.cardId] }),
  })
)

export const userCardProgress = pgTable(
  'user_card_progress',
  {
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    cardId: uuid('card_id')
      .references(() => cards.id)
      .notNull(),

    easeFactor: decimal('ease_factor', { precision: 4, scale: 2 }).default('2.5').notNull(),
    interval: integer('interval').default(0).notNull(),
    repetitions: integer('repetitions').default(0).notNull(),
    nextReviewAt: timestamp('next_review_at').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.cardId] }),
  })
)

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  cardProgress: many(userCardProgress),
  userDecks: many(userDecks),
}))

export const decksRelations = relations(decks, ({ one, many }) => ({
  owner: one(users, {
    fields: [decks.ownerId],
    references: [users.id],
  }),
  deckCards: many(deckCards),
  userDecks: many(userDecks),
}))

export const userDecksRelations = relations(userDecks, ({ one }) => ({
  user: one(users, {
    fields: [userDecks.userId],
    references: [users.id],
  }),
  deck: one(decks, {
    fields: [userDecks.deckId],
    references: [decks.id],
  }),
}))

export const cardsRelations = relations(cards, ({ many }) => ({
  contents: many(cardContents),
  deckCards: many(deckCards),
  userProgress: many(userCardProgress),
}))

export const deckCardsRelations = relations(deckCards, ({ one }) => ({
  deck: one(decks, {
    fields: [deckCards.deckId],
    references: [decks.id],
  }),
  card: one(cards, {
    fields: [deckCards.cardId],
    references: [cards.id],
  }),
}))

export const cardContentsRelations = relations(cardContents, ({ one }) => ({
  card: one(cards, {
    fields: [cardContents.cardId],
    references: [cards.id],
  }),
}))

export const userCardProgressRelations = relations(userCardProgress, ({ one }) => ({
  user: one(users, {
    fields: [userCardProgress.userId],
    references: [users.id],
  }),
  card: one(cards, {
    fields: [userCardProgress.cardId],
    references: [cards.id],
  }),
}))
