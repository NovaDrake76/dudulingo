// backend/api/db/seed.ts

import mongoose from 'mongoose'
import { cards as allCards, decks, users } from './fixtures.ts'
import connectDB from './index.ts'
import { Card, Deck, User, UserCardProgress } from './schema.ts'

const seedDatabase = async () => {
  try {
    await connectDB()

    console.log('Clearing existing data...')
    await User.deleteMany({})
    await Deck.deleteMany({})
    await Card.deleteMany({})
    await UserCardProgress.deleteMany({})

    console.log('Inserting users...')
    const createdUsers = await User.insertMany(users)

    console.log('Inserting cards...')
    const createdCards = await Card.insertMany(allCards)

    // separate cards by deck
    const animalCards = createdCards.filter((card) => card.imageUrl) // distinguish them
    const commonWordCards = createdCards.filter((card) => !card.imageUrl)

    console.log('Inserting decks...')
    const decksToCreate = decks.map((deck) => {
      let cardsForDeck = []
      if (deck.name === 'Animais') {
        cardsForDeck = animalCards.map((c) => c._id)
      } else if (deck.name === '40 Palavras Mais Comuns') {
        cardsForDeck = commonWordCards.map((c) => c._id)
      }
      return {
        ...deck,
        ownerId: createdUsers[0]._id, // assign to the first user for simplicity
        cards: cardsForDeck,
      }
    })

    await Deck.insertMany(decksToCreate)

    console.log('Database has been seeded successfully.')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await mongoose.connection.close()
  }
}

seedDatabase()
