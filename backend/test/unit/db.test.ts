import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import mongoose from 'mongoose'
import connectDB from '../../api/db'

vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
  },
}))

describe('connectDB', () => {
  const ORIGINAL_ENV = process.env
  const ORIGINAL_EXIT = process.exit

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
    process.exit = vi.fn() as never
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    process.exit = ORIGINAL_EXIT
  })

  it('throws if DATABASE_URL is not defined', async () => {
    vi.stubEnv("DATABASE_URL", '');

    await expect(connectDB()).rejects.toThrow(
      'DATABASE_URL is not defined'
    )

    expect(mongoose.connect).not.toHaveBeenCalled()
  })

  it('connects to MongoDB when DATABASE_URL is defined', async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/test'
    vi.mocked(mongoose.connect).mockResolvedValue(undefined as any)

    await connectDB()

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/test'
    )
  })
})
