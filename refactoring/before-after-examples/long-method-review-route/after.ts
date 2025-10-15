async function getDueCards(userId: string, limit: number) {
  return UserCardProgress.find({
    userId,
    nextReviewAt: { $lte: new Date() },
  })
    .sort({ nextReviewAt: 1 })
    .limit(limit)
    .populate<{ cardId: ICard }>('cardId');
}

async function getLearningCards(userId: string, limit: number, excludedIds: string[]) {
  return UserCardProgress.find({
    userId,
    cardId: { $nin: excludedIds },
  })
    .sort({ repetitions: 1, nextReviewAt: 1 })
    .limit(limit)
    .populate<{ cardId: ICard }>('cardId');
}

async function getNewCards(userId: string, limit: number, excludedIds: string[]) {
  const userDecks = await Deck.find({ _id: { $in: (await UserCardProgress.distinct('deckId', { userId })) } });
  const allUserCardIds = userDecks.flatMap(deck => deck.cards);

  const newCards = await Card.find({ 
      _id: { $in: allUserCardIds, $nin: excludedIds } 
  }).limit(limit);
  
  return newCards.map(card => ({ cardId: card, repetitions: 0 }));
}


router.get('/session/general', async (req: any, res) => {
  try {
    const userId = (req.user as IUser)._id;
    const sessionSize = 10;
    
    let sessionProgress: any[] = [];
    const seenCardIds = new Set<string>();

    // get due cards
    const dueProgress = await getDueCards(userId, sessionSize);
    sessionProgress.push(...dueProgress);
    dueProgress.forEach(p => seenCardIds.add(p.cardId._id.toString()));

    // fill with learning cards if needed
    if (sessionProgress.length < sessionSize) {
      const learningProgress = await getLearningCards(userId, sessionSize - sessionProgress.length, Array.from(seenCardIds));
      sessionProgress.push(...learningProgress);
      learningProgress.forEach(p => seenCardIds.add(p.cardId._id.toString()));
    }

    // fill with new cards if still needed
    if (sessionProgress.length < sessionSize) {
      const newProgress = await getNewCards(userId, sessionSize - sessionProgress.length, Array.from(seenCardIds));
      sessionProgress.push(...newProgress);
    }
    
    const sessionQuestions = await Promise.all(
        sessionProgress.map((progress) => createQuestionData(progress.cardId, progress))
    );
    
    res.json({ cards: sessionQuestions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create general review session' });
  }
});