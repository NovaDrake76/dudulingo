import express from 'express'
import passport from 'passport'
import authRouter from './routes/auth.ts'
import cardsRouter from './routes/cards.ts'
import decksRouter from './routes/decks.ts'
import reviewRouter from './routes/review.ts'
import usersRouter from './routes/users.ts'

const PORT = process.env.PORT || 8000
const app = express()

app.use(passport.initialize())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/cards', cardsRouter)
app.use('/decks', decksRouter)
app.use('/review', reviewRouter)
app.use('/users', usersRouter)

app.get('/', (_req, res) => {
  res.send('Alexa, ligar barulho de chuva')
})

app.listen(PORT, () => {
  console.log(`listening to Baroes da Pisadinha on port: ${PORT}`)
})
