import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import googleStrategy from '../auth/googleStrategy.ts'
import { db } from '../db/index.ts'
import { users } from '../db/schema.ts'

const router = Router()

router.get('/google', passport.authenticate(googleStrategy, { scope: ['profile', 'email'] }))

router.get(
  '/google/callback',
  passport.authenticate(googleStrategy, { session: false }),
  async (req, res) => {
    const user = req.user as any

    const [dbUser] = await db
      .insert(users)
      .values({
        providerId: user.id,
        name: user.displayName,
        photoUrl: user.photos?.[0]?.value || null,
      })
      .onConflictDoUpdate({
        target: users.providerId,
        set: {
          name: user.displayName,
          photoUrl: user.photos?.[0]?.value || null,
          updatedAt: new Date(),
        },
      })
      .returning()

    const token = jwt.sign(
      {
        id: dbUser.id,
        name: dbUser.name,
        providerId: dbUser.providerId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    if (process.env.IS_DEV === 'true') {
      //res.json(token)
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
      return
    }

    // this doesn't work in expo go, but it will work in a standalone app
    res.redirect(`dudulingo://auth/callback?token=${token}`)
  }
)

export default router
