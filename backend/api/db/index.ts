import mongoose from 'mongoose'

const connectDB = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  await mongoose.connect(process.env.DATABASE_URL)
}

export default connectDB
