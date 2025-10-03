import { Router } from 'express'
import passport from 'passport'
import { db } from '../db/index.ts'
import { cards, userCardProgress } from '../db/schema.ts'
import { and, eq, lte, sql, notExists } from 'drizzle-orm'
import { calculateSrs } from '../srs.ts'
import { alias } from 'drizzle-orm/pg-core'
import jwtStrategy from '../auth/jwtStrategy.ts'

const router = Router()

const authenticateJwt = passport.authenticate(jwtStrategy, { session: false })

router.use(authenticateJwt)

router.get('/next', async (req, res) => {
  try {
    const user = req.user as any

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const userId = user.id

    const nextDueProgress = await db.query.userCardProgress.findFirst({
      where: and(
        eq(userCardProgress.userId, userId),
        lte(userCardProgress.nextReviewAt, new Date())
      ),
      orderBy: (progress, { asc }) => [asc(progress.nextReviewAt)],
    })

    let nextCard
    if (nextDueProgress) {
      nextCard = await db.query.cards.findFirst({
        where: eq(cards.id, nextDueProgress.cardId),
        with: { contents: true },
      })
    } else {
      nextCard = await db.query.cards.findFirst({
        with: {
          contents: true,
        },
        where: (cards, { notExists }) =>
          notExists(
            db
              .select()
              .from(userCardProgress)
              .where(
                and(eq(userCardProgress.cardId, cards.id), eq(userCardProgress.userId, userId))
              )
          ),
      })
    }

    if (!nextCard) {
      return res.status(200).json({ message: "You've reviewed all cards for now!" })
    }

    res.json(nextCard)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch next review card' })
  }
})

router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id
    const { cardId, rating } = req.body
    console.log({ userId })

    if (!cardId || !rating) {
      return res.status(400).json({ error: 'cardId and rating are required' })
    }

    let currentProgress = await db.query.userCardProgress.findFirst({
      where: and(eq(userCardProgress.userId, userId), eq(userCardProgress.cardId, cardId)),
    })

    if (!currentProgress) {
      currentProgress = {
        userId,
        cardId,
        easeFactor: '2.5',
        interval: 0,
        repetitions: 0,
        nextReviewAt: new Date(),
      }
    }

    const newProgress = calculateSrs(
      {
        repetitions: currentProgress.repetitions,
        easeFactor: parseFloat(currentProgress.easeFactor),
        interval: currentProgress.interval,
      },
      rating
    )

    await db
      .insert(userCardProgress)
      .values({ userId, cardId, ...newProgress })
      .onConflictDoUpdate({
        target: [userCardProgress.userId, userCardProgress.cardId],
        set: {
          ...newProgress,
        },
      })

    res.status(200).json({ message: 'Progress updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

export default router
