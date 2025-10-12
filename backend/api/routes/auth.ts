import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { User } from '../db/schema.ts'

const router = Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const user = req.user as any

    const dbUser = await User.findOneAndUpdate(
      { providerId: user.id },
      {
        name: user.displayName,
        photoUrl: user.photos?.[0]?.value || null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const token = jwt.sign(
      {
        id: dbUser._id,
        name: dbUser.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // check if the request is coming from a mobile device's WebView
    const userAgent = req.headers['user-agent'] || ''
    const isMobile = /expo|android|iphone|ipad|ipod/i.test(userAgent)

    let redirectUrl

    if (isMobile) {
      redirectUrl = `${process.env.CLIENT_NATIVE_SCHEME}://auth/callback?token=${token}`
    } else {
      redirectUrl = `${process.env.CLIENT_WEB_URL}/auth/callback?token=${token}`
    }

    res.redirect(redirectUrl)
  }
)

export default router