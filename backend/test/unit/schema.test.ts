import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'
import { User, Card, Deck, UserCardProgress } from '../../api/db/schema.ts'

describe('Mongoose Schema Unit Tests', () => {
  describe('User Model', () => {
    it('should create a valid user with defaults', () => {
      const userData = {
        name: 'José Eduardo',
        providerId: 'google-123',
      }
      const user = new User(userData)
      const err = user.validateSync()

      expect(err).toBeUndefined()
      expect(user._id).toBeDefined()
      expect(typeof user._id).toBe('string')
      expect(user.name).toBe('José Eduardo')
    })

    it('should fail if required fields are missing', () => {
      const user = new User({})
      const err = user.validateSync()

      expect(err).toBeDefined()
      expect(err?.errors['name']).toBeDefined()
      expect(err?.errors['providerId']).toBeDefined()
    })
  })

  describe('Card Model', () => {
    it('should validate a correct card object', () => {
      const cardData = {
        type: 'basic',
        answer: 'Madrid',
        prompt: 'Capital of Spain',
      }
      const card = new Card(cardData)
      const err = card.validateSync()

      expect(err).toBeUndefined()
      expect(card.level).toBe(1)
      expect(card._id).toBeDefined()
    })

    it('should fail if enum type is invalid', () => {
      const card = new Card({
        type: 'super-hard-question',
        answer: '42',
      })
      const err = card.validateSync()

      expect(err).toBeDefined()
      expect(err?.errors['type']).toBeDefined()
      expect(err?.errors['type'].message).toContain('is not a valid enum value')
    })

    it('should fail if answer is missing', () => {
      const card = new Card({
        type: 'multiple-choice',
      })
      const err = card.validateSync()

      expect(err).toBeDefined()
      expect(err?.errors['answer']).toBeDefined()
    })
  })

  describe('Deck Model', () => {
    it('should validate a correct deck', () => {
      const deck = new Deck({
        name: 'Spanish 101',
        ownerId: 'user-uuid-123',
      })
      const err = deck.validateSync()

      expect(err).toBeUndefined()
      expect(deck.cards).toEqual([])
    })

    it('should fail if ownerId is missing', () => {
      const deck = new Deck({
        name: 'No Owner Deck',
      })
      const err = deck.validateSync()

      expect(err).toBeDefined()
      expect(err?.errors['ownerId']).toBeDefined()
    })
  })

  describe('UserCardProgress Model', () => {
    it('should validate and apply defaults correctly', () => {
      const progress = new UserCardProgress({
        userId: 'u-1',
        cardId: 'c-1',
        deckId: 'd-1',
      })
      const err = progress.validateSync()

      expect(err).toBeUndefined()
      
      expect(progress.easeFactor).toBe(2.5)
      expect(progress.interval).toBe(0)
      expect(progress.repetitions).toBe(0)
      expect(progress.nextReviewAt).toBeInstanceOf(Date)
    })

    it('should fail if foreign keys are missing', () => {
      const progress = new UserCardProgress({
        easeFactor: 2.5
      })
      const err = progress.validateSync()

      expect(err).toBeDefined()
      expect(err?.errors['userId']).toBeDefined()
      expect(err?.errors['cardId']).toBeDefined()
      expect(err?.errors['deckId']).toBeDefined()
    })

    it('should enforce number types for metrics', () => {
        const progress = new UserCardProgress({
            userId: 'u-1',
            cardId: 'c-1',
            deckId: 'd-1',
            easeFactor: 'very easy'
        })

        const err = progress.validateSync()
        expect(err).toBeDefined()
        expect(err?.errors['easeFactor']).toBeDefined() 
        expect(err?.errors['easeFactor'].kind).toBe('Number')
    })
  })
})
