import { Strategy as JwtStrategy, ExtractJwt, type VerifyCallback } from 'passport-jwt'
import { db } from '../db/index.ts'
import { users } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

const verify: VerifyCallback = async (payload, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.id),
    })
    console.log({ payload })
    console.log({ user })

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    return done(null, user)
  } catch (err) {
    return done(err, false)
  }
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || '',
}

export default new JwtStrategy(options, verify)
