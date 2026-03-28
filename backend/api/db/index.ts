import mongoose from 'mongoose'
import logger from '../logger.ts'

const connectDB = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL)
    logger.info('MongoDB connected successfully')
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error })
    process.exit(1)
  }
}

export default connectDB
