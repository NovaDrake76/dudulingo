import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import googleStrategy from '../auth/googleStrategy.ts'

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

    if (process.env.IS_DEV === 'true') {
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
      return
    }

    // this doesn't work in expo go, but it will work in a standalone app
    res.redirect(`dudulingo://auth/callback?token=${token}`)
  }
)

export default router
