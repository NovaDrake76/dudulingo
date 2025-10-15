// new helper function
async function buildSessionQuestions(cards: ICard[], progressMap: Map<string, IUserCardProgress>) {
    return Promise.all(
      cards.map(async (card) => {
        let progress = progressMap.get(card._id.toString());
        if (!progress) {
          progress = { repetitions: 0 } as any;
        }
        return createQuestionData(card, progress);
      })
    );
}

// endpoint 1 refactored
router.get('/session/general', async (req: any, res) => {
  // ... find 'sessionProgress')
  
  const progressMap = new Map(sessionProgress.map((p) => [p.cardId._id.toString(), p]));
  const cards = sessionProgress.map(p => p.cardId);

  const sessionQuestions = await buildSessionQuestions(cards, progressMap);
  res.json({ cards: sessionQuestions });
});

// endpoint 2 refactored
router.get('/deck/:deckId', async (req: any, res) => {
  // ... find 'sessionCards' and 'progressMap'
   const sessionQuestions = await buildSessionQuestions(sessionCards, progressMap);
   res.json({ deckId, cards: sessionQuestions });
});