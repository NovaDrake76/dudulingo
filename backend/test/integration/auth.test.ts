import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { Buffer } from 'buffer'
import authRouter from '../../api/routes/auth'
import { User } from '../../api/db/schema'

vi.mock('../../api/db/schema', () => ({
  User: {
    findOneAndUpdate: vi.fn(),
  },
}))

const mocks = vi.hoisted(() => ({
  passportMiddleware: vi.fn((req, res, next) => next()),
  jwtSign: vi.fn(() => 'mocked_token')

}))

vi.mock('passport', () => ({
  default: {
   authenticate: vi.fn(() => mocks.passportMiddleware),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: mocks.jwtSign,
  },
  sign: mocks.jwtSign,
}))

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

describe('Auth Route Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  describe('GET /auth/google', () => {
    it('should return 400 if state parameter is missing', async () => {
      const res = await request(app).get('/auth/google')
      expect(res.status).toBe(400)
      expect(res.text).toBe('State parameter is missing')
    })

    it('should call passport.authenticate if state is present', async () => {
      const mockMiddleware = vi.fn((req, res, next) => next())
      vi.mocked(passport.authenticate).mockReturnValue(mockMiddleware)

      await request(app).get('/auth/google?state=some-state')

      expect(passport.authenticate).toHaveBeenCalledWith('google', expect.objectContaining({
        state: 'some-state',
      }))
    })
  })

  describe('GET /auth/google/callback', () => {
    const mockUser = {
      id: 'google-123',
      displayName: 'Test User',
      photos: [{ value: 'photo.jpg' }],
    }

    const mockDbUser = {
      _id: 'db-id-123',
      name: 'Test User',
    }

    const stateObj = { redirectUri: 'dudulingo://home' }
    const validState = Buffer.from(JSON.stringify(stateObj)).toString('base64')

    it('should handle successful login and redirect with token', async () => {
      mocks.passportMiddleware.mockImplementation((req, res, next) => {
      req.user = mockUser
      next()
    })

      vi.mocked(User.findOneAndUpdate).mockResolvedValue(mockDbUser as any)
 
  const res = await request(app)
    .get(`/auth/google/callback?state=${validState}`)

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { providerId: 'google-123' },
        { name: 'Test User', photoUrl: 'photo.jpg' },
        expect.objectContaining({ upsert: true, new: true })
      )

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'db-id-123', name: 'Test User' },
        'test-secret',
        expect.anything()
      )

      expect(res.status).toBe(302)
      expect(res.headers.location).toBe(`dudulingo://home?token=mocked_token`)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(passport.authenticate).mockReturnValue((req, res, next) => {
        req.user = mockUser
        next()
      })

      vi.mocked(User.findOneAndUpdate).mockRejectedValue(new Error('DB Error'))

      const res = await request(app)
        .get(`/auth/google/callback?state=${validState}`)

      expect(res.status).toBe(302)
      expect(res.headers.location).toBe('dudulingo://home?error=callback_failed')
    })
    
    it('should fail if state is missing in callback', async () => {
       vi.mocked(passport.authenticate).mockReturnValue((req, res, next) => {
        req.user = mockUser
        next()
      })

      vi.mocked(User.findOneAndUpdate).mockResolvedValue(mockDbUser as any)

      const res = await request(app).get('/auth/google/callback')
      
      expect(res.status).toBe(302)
      expect(res.headers.location).toContain('error=missing_state')
    })
  })
})
