import { ExtractJwt, Strategy as JwtStrategy, type VerifyCallback } from 'passport-jwt'
import { User } from '../db/schema.ts'

const verify: VerifyCallback = async (payload, done) => {
  try {
    // use findOne with _id to avoid casting to ObjectId
    const user = await User.findOne({ _id: payload.id })
    if (user) {
      return done(null, user)
    }
    return done(null, false)
  } catch (err) {
    return done(err, false)
  }
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || '',
}

export default new JwtStrategy(options, verify)
