import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import deckRouter from '../../api/routes/decks' 
import { Deck, User, Card } from '../../api/db/schema'
import { randomUUID } from 'crypto'

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
    it('should create a new deck with valid data', async () => {
      const user = await createTestUser()
      
      const payload = {
        name: 'Spanish 101',
        description: 'Basic Spanish vocabulary',
        ownerId: user._id
      }

      const res = await request.post('/decks').send(payload)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('_id')
      expect(res.body.name).toBe(payload.name)
      expect(res.body.ownerId).toBe(payload.ownerId)
      const dbDeck = await Deck.findById(res.body._id)
      expect(dbDeck).toBeTruthy()
    })

    it('should return 400 if name is missing', async () => {
      const user = await createTestUser()
      const payload = {
        description: 'Missing name',
        ownerId: user._id
      }

      const res = await request.post('/decks').send(payload)
      
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/required/i)
    })

    it('should return 400 if ownerId is missing', async () => {
      const payload = {
        name: 'Orphan Deck',
        description: 'No owner'
      }

      const res = await request.post('/decks').send(payload)
      
      expect(res.status).toBe(400)
    })
  })

  describe('GET /decks', () => {
    it('should return a list of decks with card counts', async () => {
      const user = await createTestUser()
      
      const card = await Card.create({
        type: 'basic',
        answer: 'Hola',
        prompt: 'Hello'
      })
      
      await Deck.create({
        name: 'Deck 1',
        ownerId: user._id,
        cards: [card._id]
      })

      const res = await request.get('/decks')

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBe(1)
      
      const returnedDeck = res.body[0]
      expect(returnedDeck.cardCount).toBe(1)
      expect(returnedDeck.cards).toEqual([])
      expect(returnedDeck.ownerId).toHaveProperty('name', 'Test User') 
    })
  })

  describe('GET /decks/:id', () => {
    it('should return a specific deck populated with cards', async () => {
      const user = await createTestUser()
      const card = await Card.create({
        type: 'basic',
        answer: 'Gato',
        prompt: 'Cat'
      })
      
      const deck = await Deck.create({
        name: 'Animals',
        ownerId: user._id,
        cards: [card._id]
      })

      const res = await request.get(`/decks/${deck._id}`)

      expect(res.status).toBe(200)
      expect(res.body._id).toBe(deck._id)
      
      expect(res.body.cards[0]).toHaveProperty('answer', 'Gato')
    })

    it('should return 404 for non-existent ID', async () => {
      const fakeId = randomUUID()
      const res = await request.get(`/decks/${fakeId}`)
      
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /decks/:id', () => {
    it('should update deck details', async () => {
      const user = await createTestUser()
      const deck = await Deck.create({
        name: 'Old Name',
        ownerId: user._id
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
      const fakeId = randomUUID()
      const res = await request.put(`/decks/${fakeId}`).send({ name: 'Ghost' })
      
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /decks/:id', () => {
    it('should delete an existing deck', async () => {
      const user = await createTestUser()
      const deck = await Deck.create({
        name: 'To Delete',
        ownerId: user._id
      })

      const res = await request.delete(`/decks/${deck._id}`)

      expect(res.status).toBe(204)
      
      const found = await Deck.findById(deck._id)
      expect(found).toBeNull()
    })

    it('should return 404 when deleting non-existent deck', async () => {
      const fakeId = randomUUID()
      const res = await request.delete(`/decks/${fakeId}`)
      
      expect(res.status).toBe(404)
    })
  })
})
