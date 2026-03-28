import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { randomUUID } from 'crypto'

const mockUser = {
  _id: randomUUID(),
  name: 'Test User',
  providerId: 'google-deck-123'
}

vi.mock('passport', () => ({
  default: {
    authenticate: () => (req: any, _res: any, next: any) => {
      req.user = mockUser
      next()
    },
  },
}))

vi.mock('../../api/auth/jwtStrategy', () => ({
  default: {}
}))

import deckRouter from '../../api/routes/decks'
import { Deck, User, Card } from '../../api/db/schema'

const app = express()
app.use(express.json())
app.use('/decks', deckRouter)

const request = supertest(app)
let mongoServer: MongoMemoryServer

describe('Decks API Integration Tests', () => {
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })
  
  beforeEach(async () => {
    await Card.deleteMany({});
    await Deck.deleteMany({});
    await User.deleteMany({});
  })

  const createTestUser = async () => {
    return await User.create({
      name: 'Test User',
      providerId: 'google-123',
    })
  }

  describe('POST /decks', () => {
    it('should create a new deck with valid data (ownerId from auth)', async () => {
      const payload = {
        name: 'Spanish 101',
        description: 'Basic Spanish vocabulary',
      }

      const res = await request.post('/decks').send(payload)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('_id')
      expect(res.body.name).toBe(payload.name)
      expect(res.body.ownerId).toBe(mockUser._id)
      const dbDeck = await Deck.findById(res.body._id)
      expect(dbDeck).toBeTruthy()
    })

    it('should return 400 if name is missing', async () => {
      const payload = {
        description: 'Missing name',
      }

      const res = await request.post('/decks').send(payload)

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })
  })

  describe('GET /decks', () => {
    it('should return a paginated list of decks with card counts', async () => {
      const card = await Card.create({
        type: 'selection_mc',
        answer: 'Hola',
        prompt: 'Hello'
      })

      // Create deck owned by mockUser (the authenticated user)
      await Deck.create({
        name: 'Deck 1',
        ownerId: mockUser._id,
        cards: [card._id]
      })

      const res = await request.get('/decks')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body).toHaveProperty('total', 1)
      expect(res.body).toHaveProperty('page', 1)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(1)

      const returnedDeck = res.body.data[0]
      expect(returnedDeck.cardCount).toBe(1)
      expect(returnedDeck.cards).toEqual([])
    })
  })

  describe('GET /decks/:id', () => {
    it('should return a specific deck populated with cards', async () => {
      const card = await Card.create({
        type: 'selection_mc',
        answer: 'Gato',
        prompt: 'Cat'
      })

      const deck = await Deck.create({
        name: 'Animals',
        ownerId: mockUser._id,
        cards: [card._id]
      })

      const res = await request.get(`/decks/${deck._id}`)

      expect(res.status).toBe(200)
      expect(res.body._id).toBe(deck._id)
      
      expect(res.body.cards[0]).toHaveProperty('answer', 'Gato')
    })

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011' // Valid MongoDB ObjectId format
      const res = await request.get(`/decks/${fakeId}`)

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /decks/:id', () => {
    it('should update deck details', async () => {
      const deck = await Deck.create({
        name: 'Old Name',
        ownerId: mockUser._id
      })

      const updatePayload = {
        name: 'New Name',
        description: 'Updated Desc'
      }

      const res = await request.put(`/decks/${deck._id}`).send(updatePayload)

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('New Name')

      const updatedDeck = await Deck.findById(deck._id)
      expect(updatedDeck?.name).toBe('New Name')
    })

    it('should return 404 when updating non-existent deck', async () => {
      const fakeId = '507f1f77bcf86cd799439011' // Valid MongoDB ObjectId format
      const res = await request.put(`/decks/${fakeId}`).send({ name: 'Ghost' })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /decks/:id', () => {
    it('should delete an existing deck', async () => {
      const deck = await Deck.create({
        name: 'To Delete',
        ownerId: mockUser._id
      })

      const res = await request.delete(`/decks/${deck._id}`)

      expect(res.status).toBe(204)

      const found = await Deck.findById(deck._id)
      expect(found).toBeNull()
    })

    it('should return 404 when deleting non-existent deck', async () => {
      const fakeId = '507f1f77bcf86cd799439011' // Valid MongoDB ObjectId format
      const res = await request.delete(`/decks/${fakeId}`)

      expect(res.status).toBe(404)
    })
  })
})
