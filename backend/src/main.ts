import express from 'express'
import passport from 'passport'
import authRouter from './routes/auth.ts'
import { drizzle } from 'drizzle-orm/node-postgres';


const PORT = process.env.PORT || 8000
const db = drizzle(process.env.DATABASE_URL!);
const app = express()

app.use(passport.initialize())

app.use(authRouter)

app.get('/', (_req, res) => {
  res.send('Alexa, ligar barulho de chuva')
})

app.listen(PORT, () => {
  console.log(`listening to Baroes da Pisadinha on port: ${PORT}`)
})
