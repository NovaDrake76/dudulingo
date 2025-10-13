// Em backend/api/routes/review.ts

// Rota 1
router.get('/session/general', async (req: any, res) => {
  // ... (lógica para encontrar 'sessionProgress')
  const sessionQuestions = await Promise.all(
      sessionProgress.map((progress) => createQuestionData(progress.cardId, progress))
  );
  res.json({ cards: sessionQuestions });
});

// Rota 2
router.get('/deck/:deckId', async (req: any, res) => {
  // ... (lógica para encontrar 'sessionCards')
   const sessionQuestions = await Promise.all(
      sessionCards.map(async (card) => {
        let progress = progressMap.get(card._id.toString())
        if (!progress) {
          progress = { repetitions: 0 } as any
        }
        return createQuestionData(card, progress)
      })
    )
  res.json({ cards: sessionQuestions });
});