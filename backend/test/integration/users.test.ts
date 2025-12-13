import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have this installed

import userRouter from '../../api/routes/users'; 
import { User, Deck, UserCardProgress } from '../../api/db/schema';

const mockUser = { 
  id: uuidv4(), 
  email: 'test@example.com',
  name: 'Test User',
  providerId: 'google-12345'
};

vi.mock('passport', () => ({
  default: {
    authenticate: () => (req: any, res: any, next: any) => {
      req.user = mockUser;
      next();
    },
  },
}));

vi.mock('../../api/auth/jwtStrategy', () => ({
  default: {}
}));

const app = express();
app.use(express.json());
app.use('/users', userRouter);

describe('User Integration Tests', () => {
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
    await User.deleteMany({});
    await Deck.deleteMany({});
    await UserCardProgress.deleteMany({});
  });

  describe('GET /me', () => {
    it('should return the authenticated user', async () => {
      const response = await request(app).get('/users/me');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });
  });

  describe('POST /language', () => {
    it('should update the user language', async () => {
      // FIX: Added required fields 'name' and 'providerId'
      await User.create({ 
        _id: mockUser.id, 
        email: mockUser.email,
        name: mockUser.name,
        providerId: mockUser.providerId
      });

      const response = await request(app)
        .post('/users/language')
        .send({ language: 'fr' });

      expect(response.status).toBe(200);
      expect(response.body.user.selectedLanguage).toBe('fr');

      const dbUser = await User.findById(mockUser.id);
      expect(dbUser?.selectedLanguage).toBe('fr');
    });

    it('should return 400 if language is missing', async () => {
      const response = await request(app)
        .post('/users/language')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/required/i);
    });
  });

  describe('POST /decks/:deckId', () => {
    it('should add deck cards to user progress', async () => {
      const card1Id = uuidv4();
      const card2Id = uuidv4();
      const ownerId = uuidv4();

      const deck = await Deck.create({
        name: 'Test Deck',
        cards: [card1Id, card2Id], 
        ownerId: ownerId
      });

      const response = await request(app).post(`/users/decks/${deck._id}`);

      expect(response.status).toBe(200);
      expect(response.body.cardsAdded).toBe(2);

      const progress = await UserCardProgress.find({ userId: mockUser.id, deckId: deck._id });
      expect(progress).toHaveLength(2);
    });

    it('should return 404 if deck does not exist', async () => {
      const fakeId = uuidv4();
      const response = await request(app).post(`/users/decks/${fakeId}`);
      expect(response.status).toBe(404);
    });

    it('should ignore duplicate key errors (idempotency)', async () => {
      const cardId = uuidv4();
      const ownerId = uuidv4();

      // FIX: Added 'ownerId' and fixed 'cards' structure
      const deck = await Deck.create({ 
        name: 'Idempotency Deck',
        cards: [cardId],
        ownerId: ownerId 
      });

      // First call
      await request(app).post(`/users/decks/${deck._id}`);
      
      // Second call (should succeed without 500 error)
      const response = await request(app).post(`/users/decks/${deck._id}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /stats', () => {
    it('should calculate mastered vs learning words correctly', async () => {
      const commonData = {
        deckId: uuidv4(),
        cardId: uuidv4()
      };

      await UserCardProgress.create([
        { userId: mockUser.id, repetitions: 5, cardId: uuidv4(), deckId: uuidv4() },
        { userId: mockUser.id, repetitions: 10, cardId: uuidv4(), deckId: uuidv4() },
        { userId: mockUser.id, repetitions: 2, cardId: uuidv4(), deckId: uuidv4() },
      ]);

      const response = await request(app).get('/users/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalWords: 3,
        masteredWords: 2,
        learningWords: 1,
      });
    });
  });
});
