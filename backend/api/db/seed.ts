import mongoose from 'mongoose'
import { cards, decks, users } from './fixtures.ts'
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
    const createdCards = await Card.insertMany(cards)

    console.log('Inserting decks...')
    const decksToCreate = decks.map((deck) => ({
      ...deck,
      ownerId: createdUsers[0]._id, 
      cards: createdCards.map((c) => c._id), 
    }))
    await Deck.insertMany(decksToCreate)

    console.log('Database has been seeded successfully.')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await mongoose.connection.close()
  }
}

seedDatabase()
