import cors from 'cors';
import express from 'express';
import passport from 'passport';
import googleStrategy from './auth/googleStrategy.ts';
import jwtStrategy from './auth/jwtStrategy.ts';
import connectDB from './db/index.ts';
import authRouter from './routes/auth.ts';
import cardsRouter from './routes/cards.ts';
import decksRouter from './routes/decks.ts';
import reviewRouter from './routes/review.ts';
import usersRouter from './routes/users.ts';

connectDB();

const PORT = process.env.PORT || 8000;
const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

passport.use(googleStrategy);
passport.use(jwtStrategy);

app.use('/auth', authRouter);
app.use('/cards', cardsRouter);
app.use('/decks', decksRouter);
app.use('/review', reviewRouter);
app.use('/users', usersRouter);

app.get('/', (_req, res) => {
  res.send('Dudulingo API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});