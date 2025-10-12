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

    // for web, we redirect to the CLIENT_URL.
    // for native mobile, we use the deep link scheme.
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);
    
    const redirectUrl =
      isMobile && process.env.NATIVE_SCHEME
        ? `${process.env.NATIVE_SCHEME}://auth/callback?token=${token}`
        : `${process.env.CLIENT_URL}/auth/callback?token=${token}`

    res.redirect(redirectUrl)
  }
)

export default router