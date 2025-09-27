import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'

import googleStrategy from './auth/config.ts'

const PORT = process.env.PORT || 8000
const app = express()

passport.use(googleStrategy)

app.use(passport.initialize())

app.get('/', (_req, res) => {
  res.send('Alexa, ligar barulho de chuva')
})

app.get('/auth/google', passport.authenticate(googleStrategy, { scope: ['profile', 'email'] }))

app.get(
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

app.listen(PORT, () => {
  console.log(`listening to Baroes da Pisadinha on port: ${PORT}`)
})
