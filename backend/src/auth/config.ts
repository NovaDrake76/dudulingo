import passport, { type Profile } from 'passport'
import { Strategy, type VerifyCallback } from 'passport-google-oauth20'

async function verify(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback
) {
  const user = {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.emails?.[0].value,
  }
  return done(null, user)
}

const options = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: `http://${process.env.BASE_URL}:${process.env.PORT}/auth/google/callback`,
}

export default new Strategy(options, verify)
