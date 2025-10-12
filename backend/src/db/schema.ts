import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
const { Schema, model, models, Document } = mongoose

export interface IUser extends Document {
  _id: string
  name: string
  providerId: string
  photoUrl?: string
  selectedLanguage?: string
}

export interface ICard extends Document {
  _id: string
  type: 'basic' | 'multiple-choice' | 'fill-in-the-blank'
  level: number
  prompt?: string
  answer: string
  imageUrl?: string
  lang?: string
}

export interface IDeck extends Document {
  _id: string
  name: string
  description?: string
  ownerId: string
  cards: string[]
}

export interface IUserCardProgress extends Document {
  _id: string
  userId: string
  cardId: string
  deckId: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

// Mongoose Schemas
const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    providerId: { type: String, required: true, unique: true },
    photoUrl: String,
    selectedLanguage: String,
  },
  { timestamps: true, _id: false }
)

const CardSchema = new Schema<ICard>(
  {
    _id: { type: String, default: uuidv4 },
    type: { type: String, enum: ['basic', 'multiple-choice', 'fill-in-the-blank'], required: true },
    level: { type: Number, default: 1 },
    prompt: String,
    answer: { type: String, required: true },
    imageUrl: String,
    lang: String,
  },
  { timestamps: true, _id: false }
)

const DeckSchema = new Schema<IDeck>(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    description: String,
    ownerId: { type: String, ref: 'User', required: true },
    cards: [{ type: String, ref: 'Card' }],
  },
  { timestamps: true, _id: false }
)

const UserCardProgressSchema = new Schema<IUserCardProgress>({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, ref: 'User', required: true },
  cardId: { type: String, ref: 'Card', required: true },
  deckId: { type: String, ref: 'Deck', required: true },
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  nextReviewAt: { type: Date, default: Date.now },
})
UserCardProgressSchema.index({ userId: 1, cardId: 1 }, { unique: true })

// Export Models
export const User = models.User || model<IUser>('User', UserSchema)
export const Card = models.Card || model<ICard>('Card', CardSchema)
export const Deck = models.Deck || model<IDeck>('Deck', DeckSchema)
export const UserCardProgress =
  models.UserCardProgress || model<IUserCardProgress>('UserCardProgress', UserCardProgressSchema)
