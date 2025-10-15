
router.get('/session/general', async (req: any, res) => {
  try {
    const userId = (req.user as IUser)._id;
    const sessionSize = 10;

    // prioritize cards that are due for review
    const dueProgress = await UserCardProgress.find({
      userId,
      nextReviewAt: { $lte: new Date() },
    })
      .sort({ nextReviewAt: 1 })
      .limit(sessionSize)
      .populate<{ cardId: ICard }>('cardId');

    let sessionProgress = dueProgress;
    const seenCardIds = new Set(dueProgress.map((p) => p.cardId._id.toString()));

    // if not enough due cards, add cards the user is still learning
    if (sessionProgress.length < sessionSize) {
      const learningProgress = await UserCardProgress.find({
        userId,
        cardId: { $nin: Array.from(seenCardIds) },
      })
        .sort({ repetitions: 1, nextReviewAt: 1 })
        .limit(sessionSize - sessionProgress.length)
        .populate<{ cardId: ICard }>('cardId');
      
      sessionProgress = [...sessionProgress, ...learningProgress];
      learningProgress.forEach(p => seenCardIds.add(p.cardId._id.toString()));
    }
    
    // if still not enough, add brand new cards the user has never seen
     if (sessionProgress.length < sessionSize) {
        const userDecks = await Deck.find({ _id: { $in: (await UserCardProgress.distinct('deckId', { userId })) } });
        const allUserCardIds = userDecks.flatMap(deck => deck.cards);

        const newCards = await Card.find({ 
            _id: { $in: allUserCardIds, $nin: Array.from(seenCardIds) } 
        }).limit(sessionSize - sessionProgress.length);
        
        const newProgress = newCards.map(card => ({ cardId: card, repetitions: 0 }));
        sessionProgress = [...sessionProgress, ...newProgress as any];
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