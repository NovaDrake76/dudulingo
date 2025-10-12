import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables')
    }
    await mongoose.connect(process.env.DATABASE_URL)
    console.log('MongoDB connected successfully')
  } catch (err) {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  }
}

export default connectDB
