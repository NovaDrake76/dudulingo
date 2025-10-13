// Nova função helper
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

// Rota 1 Refatorada
router.get('/session/general', async (req: any, res) => {
  // ... (lógica para encontrar 'sessionProgress')
  
  // Cria um map a partir do array de progresso para a função helper
  const progressMap = new Map(sessionProgress.map((p) => [p.cardId._id.toString(), p]));
  const cards = sessionProgress.map(p => p.cardId);

  const sessionQuestions = await buildSessionQuestions(cards, progressMap);
  res.json({ cards: sessionQuestions });
});

// Rota 2 Refatorada
router.get('/deck/:deckId', async (req: any, res) => {
  // ... (lógica para encontrar 'sessionCards' e 'progressMap')
   const sessionQuestions = await buildSessionQuestions(sessionCards, progressMap);
   res.json({ deckId, cards: sessionQuestions });
});