import { Router } from 'express'
import passport from 'passport'
import googleStrategy from '../auth/googleStrategy.ts'
import jwt from 'jsonwebtoken'

const router = Router()

router.get('/auth/google', passport.authenticate(googleStrategy, { scope: ['profile', 'email'] }))

router.get(
  '/auth/google/callback',
  passport.authenticate(googleStrategy, { session: false }),
  (req, res) => {
    const user = req.user as any
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({ token })
  }
)

export default router
