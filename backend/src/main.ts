import express from 'express'
import passport from 'passport'
import authRouter from './routes/auth.ts'
import cardsRouter from './routes/cards.ts'
import reviewRouter from './routes/review.ts'
import decksRouter from './routes/decks.ts'
import { drizzle } from 'drizzle-orm/node-postgres'

const PORT = process.env.PORT || 8000
const app = express()

app.use(passport.initialize())

app.use(authRouter)
app.use('/cards', cardsRouter)
app.use('/decks', decksRouter)
app.use('/review', reviewRouter)

app.get('/', (_req, res) => {
  res.send('Alexa, ligar barulho de chuva')
})

app.listen(PORT, () => {
  console.log(`listening to Baroes da Pisadinha on port: ${PORT}`)
})
