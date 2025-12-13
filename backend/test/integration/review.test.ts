import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { v4 as uuidv4 } from 'uuid';
import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import reviewRouter from '../../api/routes/review'; 
import { User, Deck, Card, UserCardProgress } from '../../api/db/schema';

const mockUser = { 
  _id: uuidv4(),
  id: uuidv4(),
  email: 'test@example.com',
  name: 'Test Student',
  providerId: 'google-study-123'
};
mockUser.id = mockUser._id;

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
app.use('/review', reviewRouter);

describe('Review (Study) Integration Tests', () => {
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
    await Card.deleteMany({});
    await UserCardProgress.deleteMany({});
  });

  const setupDeckWithCards = async () => {
    const ownerId = uuidv4();
    
    // Create Cards
    const cards = await Card.create([
      { _id: uuidv4(), type: 'basic', prompt: 'Cat', answer: 'Gato', imageUrl: 'cat.jpg' },
      { _id: uuidv4(), type: 'basic', prompt: 'Dog', answer: 'Cachorro', imageUrl: 'dog.jpg' },
      { _id: uuidv4(), type: 'basic', prompt: 'Bird', answer: 'Passaro', imageUrl: 'bird.jpg' },
      { _id: uuidv4(), type: 'basic', prompt: 'Fish', answer: 'Peixe', imageUrl: 'fish.jpg' },
    ]);

    // Create Deck
    const deck = await Deck.create({
      _id: uuidv4(),
      name: 'Portuguese Basics',
      ownerId: ownerId,
      cards: cards.map(c => c._id)
    });

    return { deck, cards, ownerId };
  };

  describe('GET /review/session/general', () => {
    it('should return empty session if user has no started decks', async () => {
      await setupDeckWithCards(); 
      
      const response = await request(app).get('/review/session/general');
      
      expect(response.status).toBe(200);
      expect(response.body.cards).toEqual([]);
    });

    it('should return new cards if user has started the deck', async () => {
      const { deck, cards } = await setupDeckWithCards();

      await UserCardProgress.create({
        userId: mockUser._id,
        cardId: cards[0]._id,
        deckId: deck._id,
        repetitions: 1
      });

      const response = await request(app).get('/review/session/general');

      expect(response.status).toBe(200);
      expect(response.body.cards.length).toBeGreaterThan(0);
      
      const newCardQuestion = response.body.cards.find((c: any) => c.cardId === cards[1]._id);
      expect(newCardQuestion).toBeDefined();
      expect(newCardQuestion.questionType).toBe('image_and_word_to_translation_mc'); // First exposure logic
    });

    it('should prioritize due cards', async () => {
      const { deck, cards } = await setupDeckWithCards();

      await UserCardProgress.create({
        userId: mockUser._id,
        cardId: cards[0]._id,
        deckId: deck._id,
        nextReviewAt: new Date(Date.now() - 100000), // In the past
        repetitions: 3
      });

      const response = await request(app).get('/review/session/general');

      expect(response.status).toBe(200);
      const firstQuestion = response.body.cards[0];
      
      // The due card should be first
      expect(firstQuestion.cardId).toBe(cards[0]._id);
      // Repetitions 3 logic -> 'word_to_translation_mc'
      expect(firstQuestion.questionType).toBe('word_to_image_mc');
    });

    it('should include distractors (wrong options) for MC questions', async () => {
      const { deck, cards } = await setupDeckWithCards();
      
      await UserCardProgress.create({
        userId: mockUser._id,
        cardId: cards[0]._id,
        deckId: deck._id
      });

      const response = await request(app).get('/review/session/general');
      const question = response.body.cards[0];

      if (question.options) {
        expect(question.options.length).toBeGreaterThan(1);
        const uniqueOptions = new Set(question.options.map((o: any) => typeof o === 'string' ? o : o.text));
        expect(uniqueOptions.size).toBe(question.options.length);
      }
    });
  });

  describe('GET /review/deck/:deckId', () => {
    it('should return review session specific to a deck', async () => {
      const { deck, cards } = await setupDeckWithCards();

      const response = await request(app).get(`/review/deck/${deck._id}`);

      expect(response.status).toBe(200);
      expect(response.body.deckId).toBe(deck._id);
      expect(response.body.cards.length).toBeGreaterThan(0);
      expect(response.body.cards[0].cardId).toBe(cards[0]._id);
    });

    it('should return 404 if deck does not exist', async () => {
      const fakeId = uuidv4();
      const response = await request(app).get(`/review/deck/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/not found/i);
    });
  });

  describe('POST /review', () => {
    it('should create new progress for a card', async () => {
      const { deck, cards } = await setupDeckWithCards();
      const targetCard = cards[0];

      const response = await request(app)
        .post('/review')
        .send({
          cardId: targetCard._id,
          rating: 'easy'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/success/i);

      const progress = await UserCardProgress.findOne({ userId: mockUser._id, cardId: targetCard._id });
      expect(progress).toBeDefined();
      expect(progress?.deckId).toBe(deck._id);
      expect(progress?.repetitions).toBeGreaterThan(0);
    });

    it('should update existing progress', async () => {
      const { deck, cards } = await setupDeckWithCards();
      const targetCard = cards[0];

      const initialProgress = await UserCardProgress.create({
        userId: mockUser._id,
        cardId: targetCard._id,
        deckId: deck._id,
        repetitions: 4,
        interval: 1,
        easeFactor: 2.5
      });

      await request(app)
        .post('/review')
        .send({
          cardId: targetCard._id,
          rating: 'easy'
        });

      const updatedProgress = await UserCardProgress.findById(initialProgress._id);
      
      expect(updatedProgress).toBeDefined();
      expect(updatedProgress?.interval).toBeGreaterThan(1);
      expect(updatedProgress?.repetitions).toBeGreaterThan(1);
    });

    it('should return 400 if cardId or rating is missing', async () => {
      const response = await request(app)
        .post('/review')
        .send({ rating: 'easy' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/required/i);
    });

    it('should return 404 if card deck is not found (orphaned card)', async () => {
      const orphanCard = await Card.create({
        _id: uuidv4(),
        type: 'basic',
        answer: 'Orphan',
        prompt: 'Orphan'
      });

      const response = await request(app)
        .post('/review')
        .send({
          cardId: orphanCard._id,
          rating: 'good'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/deck not found/i);
    });
  });
});
