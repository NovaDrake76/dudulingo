import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  deleteDecksForLang,
  getCardById,
  getDeckById,
  getProgress,
  getUserStats,
  listCardsInDeck,
  listCardsInDeckWithProgress,
  listDecksWithCardCount,
  listDueProgress,
  listLearningProgress,
  listNewCardsInLang,
  resetAllProgress,
  upsertProgress,
} from "./db/queries";
import { resolveCard, resolveCards, type ResolvedCard } from "./db/paths";
import type { CardRow } from "./db/types";
import {
  generateQuestion,
  type Card as QgCard,
  type QuestionData,
} from "./review/questionGenerator";
import { calculateSrs, type Rating } from "./srs";

const SESSION_SIZE = 10;
const MASTERY_THRESHOLD = 5;

const SELECTED_LANGUAGE_KEY = "selectedLanguage";

async function getSelectedLanguage(): Promise<string | null> {
  return AsyncStorage.getItem(SELECTED_LANGUAGE_KEY);
}

function toQgCard(c: ResolvedCard): QgCard {
  return {
    id: c.id,
    type: c.type,
    prompt: c.prompt,
    answer: c.answer,
    imageUrl: c.imageUrl,
    audioUrl: c.audioUrl,
    emoji: c.emoji,
    imageKey: c.imageKey,
    lang: c.lang,
  };
}

/**
 * Build a review session from a list of (card, progress) pairs.
 * For each session card we also need the deck's other cards as MC distractors.
 */
async function buildSessionQuestions(
  items: { card: CardRow; repetitions: number }[],
): Promise<QuestionData[]> {
  // cache the "deck cards" lookup per deck to avoid N queries
  const deckCardsCache = new Map<string, QgCard[]>();

  const getDeckCards = async (deckId: string): Promise<QgCard[]> => {
    const cached = deckCardsCache.get(deckId);
    if (cached) return cached;
    const rows = await listCardsInDeck(deckId);
    const resolved = await resolveCards(rows);
    const mapped = resolved.map(toQgCard);
    deckCardsCache.set(deckId, mapped);
    return mapped;
  };

  const questions: QuestionData[] = [];
  for (const { card, repetitions } of items) {
    const resolved = await resolveCard(card);
    const deckCards = await getDeckCards(card.deck_id);
    questions.push(
      generateQuestion(toQgCard(resolved), deckCards, { repetitions }),
    );
  }
  return questions;
}

export const api = {
  // ---------- auth (stubs — Phase 2 removes the callers) ----------
  async saveAuthToken(_token: string) {
    // no-op; kept so legacy callers don't crash during the transition
  },

  async checkAuth() {
    return true; // always "authenticated" in offline mode
  },

  // ---------- user / prefs ----------
  async saveLanguage(language: string) {
    await AsyncStorage.setItem(SELECTED_LANGUAGE_KEY, language);
    return { language };
  },

  async getMe() {
    const selectedLanguage = await getSelectedLanguage();
    return {
      _id: "local-device",
      name: "Learner",
      selectedLanguage,
    };
  },

  async getUserStats() {
    const lang = await getSelectedLanguage();
    return getUserStats(lang ?? undefined);
  },

  // ---------- decks ----------
  async getAllDecks() {
    const lang = await getSelectedLanguage();
    const rows = await listDecksWithCardCount(lang ?? undefined);
    return rows.map((r) => ({
      _id: r.id,
      name: r.name,
      description: r.description ?? "",
      lang: r.lang ?? undefined,
      cardCount: r.card_count,
    }));
  },

  async getDeck(deckId: string) {
    const row = await getDeckById(deckId);
    if (!row) throw new Error(`Deck not found: ${deckId}`);
    const cardsRows = await listCardsInDeck(deckId);
    const cards = await resolveCards(cardsRows);
    return {
      _id: row.id,
      name: row.name,
      description: row.description ?? "",
      lang: row.lang ?? undefined,
      cards: cards.map((c) => ({
        _id: c.id,
        prompt: c.prompt,
        answer: c.answer,
        imageUrl: c.imageUrl,
        audioUrl: c.audioUrl,
        lang: c.lang,
      })),
    };
  },

  // ---------- review sessions ----------
  async getGeneralReviewSession() {
    const now = Date.now();
    const due = await listDueProgress(SESSION_SIZE, now);

    const items: { card: CardRow; repetitions: number }[] = due.map((d) => ({
      card: d.card,
      repetitions: d.progress!.repetitions,
    }));
    const seen = new Set(items.map((i) => i.card.id));

    if (items.length < SESSION_SIZE) {
      const learning = await listLearningProgress(
        SESSION_SIZE - items.length,
        Array.from(seen),
      );
      for (const l of learning) {
        items.push({ card: l.card, repetitions: l.progress!.repetitions });
        seen.add(l.card.id);
      }
    }

    if (items.length < SESSION_SIZE) {
      const lang = await getSelectedLanguage();
      if (lang) {
        const newCards = await listNewCardsInLang(
          lang,
          SESSION_SIZE - items.length,
          Array.from(seen),
        );
        for (const c of newCards) {
          items.push({ card: c, repetitions: 0 });
          seen.add(c.id);
        }
      }
    }

    const questions = await buildSessionQuestions(items);
    return { cards: questions };
  },

  async getDeckReviewSession(deckId: string) {
    const rows = await listCardsInDeckWithProgress(deckId);
    const now = Date.now();
    const due: typeof rows = [];
    const learning: typeof rows = [];
    const fresh: typeof rows = [];

    for (const r of rows) {
      if (!r.progress) {
        fresh.push(r);
      } else if (r.progress.next_review_at <= now) {
        due.push(r);
      } else if (r.progress.repetitions < MASTERY_THRESHOLD) {
        learning.push(r);
      }
    }
    due.sort(
      (a, b) =>
        (a.progress?.next_review_at ?? 0) - (b.progress?.next_review_at ?? 0),
    );
    const picked = [...due, ...learning, ...fresh].slice(0, SESSION_SIZE);

    const items = picked.map((r) => ({
      card: r.card,
      repetitions: r.progress?.repetitions ?? 0,
    }));
    const questions = await buildSessionQuestions(items);
    return { deckId, cards: questions };
  },

  async submitReview(cardId: string, rating: string) {
    const currentRow = await getProgress(cardId);
    const card = await getCardById(cardId);
    if (!card) throw new Error(`Card not found: ${cardId}`);

    const base = currentRow
      ? {
          repetitions: currentRow.repetitions,
          easeFactor: currentRow.ease_factor,
          interval: currentRow.interval,
        }
      : { repetitions: 0, easeFactor: 2.5, interval: 0 };

    const { repetitions, easeFactor, interval, nextReviewAt } = calculateSrs(
      base,
      rating as Rating,
    );

    await upsertProgress({
      card_id: cardId,
      deck_id: card.deck_id,
      ease_factor: easeFactor,
      interval,
      repetitions,
      next_review_at: nextReviewAt.getTime(),
      updated_at: Date.now(),
      synced_at: null, // dirty for future sync
    });

    return { message: "Progress updated successfully" };
  },

  // ---------- admin / maintenance ----------
  async resetAllProgress() {
    await resetAllProgress();
  },

  async deletePackContent(lang: string) {
    await deleteDecksForLang(lang);
  },
};
