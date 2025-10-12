import { type Profile } from 'passport'
import { Strategy, type VerifyCallback } from 'passport-google-oauth20'

async function verify(
  _accessToken: string,
  _refreshToken: string,
  profile: Profile,
  done: VerifyCallback
) {
  const user = {
    id: profile.id,
    displayName: profile.displayName,
    emails: profile.emails,
    photos: profile.photos,
  }
  return done(null, user)
}

const options = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: `${process.env.API_URL}/auth/google/callback`,
}

export default new Strategy(options, verify)