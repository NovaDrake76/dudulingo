const RATING_TO_QUALITY: { [key: string]: number } = {
  very_hard: 0,
  hard: 1,
  medium: 3,
  easy: 4,
  very_easy: 5,
}

interface CardProgress {
  repetitions: number
  easeFactor: number
  interval: number
}

export function calculateSrs(
  progress: CardProgress,
  rating: 'very_hard' | 'hard' | 'medium' | 'easy' | 'very_easy'
) {
  const quality = RATING_TO_QUALITY[rating]

  if (quality < 3) {
    progress.repetitions = 0
    progress.interval = 1
  } else {
    progress.repetitions += 1

    const newEaseFactor =
      progress.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    progress.easeFactor = Math.max(1.3, newEaseFactor)

    if (progress.repetitions === 1) {
      progress.interval = 1
    } else if (progress.repetitions === 2) {
      progress.interval = 6
    } else {
      progress.interval = Math.ceil(progress.interval * progress.easeFactor)
    }
  }

  // Calculate the next review date
  const now = new Date()
  const nextReviewDate = new Date(now.setDate(now.getDate() + progress.interval))

  return {
    ...progress,
    nextReviewAt: nextReviewDate,
  }
}
