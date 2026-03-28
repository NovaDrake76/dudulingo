import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { v4 as uuidv4 } from 'uuid';

const mockUser = {
  _id: uuidv4(),
  name: 'Test User',
  providerId: 'google-test-123'
};

vi.mock('passport', () => ({
  default: {
    authenticate: () => (req: any, _res: any, next: any) => {
      req.user = mockUser;
      next();
    },
  },
}));

vi.mock('../../api/auth/jwtStrategy', () => ({
  default: {}
}));

import cardRouter from '../../api/routes/cards';
import { Card, Deck } from '../../api/db/schema';

const app = express();
app.use(express.json());
app.use('/cards', cardRouter);

describe('Card Router Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Card.deleteMany({});
    await Deck.deleteMany({});
  });

  describe('POST /', () => {
    it('should create a card successfully', async () => {
      const payload = {
        type: 'selection_mc',
        prompt: 'Hello',
        answer: 'Hola',
        lang: 'es',
        level: 1
      };

      const response = await request(app).post('/cards').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.prompt).toBe('Hello');
    });

    it('should return 400 if type or answer is missing', async () => {
      const response = await request(app)
        .post('/cards')
        .send({ prompt: 'Missing info' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should add the new card to a Deck if deckId is provided', async () => {
      // Use mockUser's ID for ownership
      const deck = await Deck.create({
        name: 'Spanish 101',
        cards: [],
        ownerId: mockUser._id
      });

      const payload = {
        type: 'selection_mc',
        prompt: 'Cat',
        answer: 'Gato',
        deckId: deck._id.toString()
      };

      const response = await request(app).post('/cards').send(payload);

      expect(response.status).toBe(201);
      const newCardId = response.body._id;

      const updatedDeck = await Deck.findById(deck._id);

      expect(updatedDeck?.cards.map(c => c.toString())).toContain(newCardId);
    });
  });

  describe('GET /', () => {
    it('should return paginated cards', async () => {
      await Card.create([
        { type: 'selection_mc', prompt: 'A', answer: 'B' },
        { type: 'selection_mc', prompt: 'C', answer: 'D' }
      ]);

      const response = await request(app).get('/cards');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /:id', () => {
    it('should return a single card by ID', async () => {
      const card = await Card.create({ type: 'selection_mc', prompt: 'Test', answer: 'Answer' });
      
      const response = await request(app).get(`/cards/${card._id}`);
      expect(response.status).toBe(200);
      expect(response.body.prompt).toBe('Test');
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      const response = await request(app).get(`/cards/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /:id', () => {
    it('should update a card', async () => {
      const card = await Card.create({ type: 'selection_mc', prompt: 'Old', answer: 'OldAnswer' });

      const response = await request(app)
        .put(`/cards/${card._id}`)
        .send({ prompt: 'New', answer: 'NewAnswer' });

      expect(response.status).toBe(200);
      expect(response.body.prompt).toBe('New');

      const updated = await Card.findById(card._id);
      expect(updated?.prompt).toBe('New');
    });

    it('should return 404 if updating non-existent card', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      const response = await request(app).put(`/cards/${fakeId}`).send({ prompt: 'Test' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a card and return 204', async () => {
      const card = await Card.create({ type: 'selection_mc', prompt: 'Delete Me', answer: 'Bye' });

      const response = await request(app).delete(`/cards/${card._id}`);
      expect(response.status).toBe(204);

      const found = await Card.findById(card._id);
      expect(found).toBeNull();
    });

    it('should remove the card reference from any Decks upon deletion', async () => {
      const card = await Card.create({ type: 'selection_mc', prompt: 'Linked', answer: 'Yes' });

      const deck = await Deck.create({
        name: 'Linked Deck',
        cards: [card._id],
        ownerId: mockUser._id
      });

      await request(app).delete(`/cards/${card._id}`);

      const updatedDeck = await Deck.findById(deck._id);
      expect(updatedDeck?.cards).not.toContain(card._id);
      expect(updatedDeck?.cards).toHaveLength(0);
    });

    it('should return 404 if deleting non-existent card', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      const response = await request(app).delete(`/cards/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });
});
