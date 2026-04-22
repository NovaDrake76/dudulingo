import { api } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// We mock the query layer so these tests don't need a real SQLite DB.
jest.mock("@/services/db/queries", () => ({
  getProgress: jest.fn(),
  getCardById: jest.fn(),
  getDeckById: jest.fn(),
  getUserStats: jest.fn(),
  listDecksWithCardCount: jest.fn(),
  listCardsInDeck: jest.fn(),
  listCardsInDeckWithProgress: jest.fn(),
  listDueProgress: jest.fn(),
  listLearningProgress: jest.fn(),
  listNewCardsInLang: jest.fn(),
  upsertProgress: jest.fn(),
  insertReviewEvent: jest.fn(),
  listReviewEventsSince: jest.fn().mockResolvedValue([]),
  countReviewEvents: jest.fn().mockResolvedValue(0),
  listDueCountsByDeck: jest.fn().mockResolvedValue([]),
  resetAllProgress: jest.fn(),
  deleteDecksForLang: jest.fn(),
  getActivePack: jest.fn().mockResolvedValue(null),
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn().mockReturnValue("generated-uuid"),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///docs/",
}));

import * as queries from "@/services/db/queries";

const q = queries as jest.Mocked<typeof queries>;

describe("api (local-first)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("stubs", () => {
    it("saveAuthToken is a no-op (does not throw)", async () => {
      await expect(api.saveAuthToken("ignored")).resolves.toBeUndefined();
    });

    it("checkAuth always returns true", async () => {
      await expect(api.checkAuth()).resolves.toBe(true);
    });

  });

  describe("language preference", () => {
    it("saveLanguage writes to AsyncStorage", async () => {
      await api.saveLanguage("pt-BR");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "selectedLanguage",
        "pt-BR",
      );
    });

    it("getMe reads selectedLanguage from AsyncStorage", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("it");
      const me = await api.getMe();
      expect(me.selectedLanguage).toBe("it");
      expect(me.name).toBe("Learner");
    });
  });

  describe("getAllDecks", () => {
    it("filters by selectedLanguage when one is set", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("it");
      q.listDecksWithCardCount.mockResolvedValue([
        {
          id: "d1",
          name: "Animali",
          description: null,
          lang: "it",
          pack_version: 1,
          updated_at: 0,
          card_count: 12,
        },
      ]);
      const result = await api.getAllDecks();
      expect(q.listDecksWithCardCount).toHaveBeenCalledWith("it");
      expect(result).toEqual([
        { _id: "d1", name: "Animali", description: "", lang: "it", cardCount: 12 },
      ]);
    });

    it("passes undefined lang when none is selected", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      q.listDecksWithCardCount.mockResolvedValue([]);
      await api.getAllDecks();
      expect(q.listDecksWithCardCount).toHaveBeenCalledWith(undefined);
    });
  });

  describe("submitReview", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 0, 1));
    });
    afterEach(() => jest.useRealTimers());

    it("computes SRS from existing progress and upserts the new state", async () => {
      q.getCardById.mockResolvedValue({
        id: "c1",
        deck_id: "d1",
        type: "basic",
        level: 1,
        prompt: "Gato",
        answer: "Cat",
        image_path: null,
        image_source: null,
        image_license: null,
        audio_path: null,
        emoji: null,
        image_key: null,
        lang: "en",
        pack_version: 1,
      });
      q.getProgress.mockResolvedValue({
        card_id: "c1",
        deck_id: "d1",
        ease_factor: 2.5,
        interval: 6,
        repetitions: 2,
        next_review_at: 0,
        updated_at: 0,
        synced_at: null,
      });

      await api.submitReview("c1", "very_easy");

      expect(q.upsertProgress).toHaveBeenCalledTimes(1);
      const call = q.upsertProgress.mock.calls[0][0];
      expect(call.card_id).toBe("c1");
      expect(call.deck_id).toBe("d1");
      expect(call.repetitions).toBe(3);
      expect(call.interval).toBe(16); // ceil(6 * 2.6)
      expect(call.ease_factor).toBeCloseTo(2.6);
      expect(call.synced_at).toBeNull();
    });

    it("treats a missing progress row as a fresh card (repetitions=0)", async () => {
      q.getCardById.mockResolvedValue({
        id: "c2",
        deck_id: "d1",
        type: "basic",
        level: 1,
        prompt: "Cachorro",
        answer: "Dog",
        image_path: null,
        image_source: null,
        image_license: null,
        audio_path: null,
        emoji: null,
        image_key: null,
        lang: "en",
        pack_version: 1,
      });
      q.getProgress.mockResolvedValue(null);

      await api.submitReview("c2", "easy");

      const call = q.upsertProgress.mock.calls[0][0];
      expect(call.repetitions).toBe(1);
      expect(call.interval).toBe(1);
    });

    it("throws when the card does not exist", async () => {
      q.getCardById.mockResolvedValue(null);
      q.getProgress.mockResolvedValue(null);
      await expect(api.submitReview("missing", "easy")).rejects.toThrow(
        /Card not found/,
      );
      expect(q.upsertProgress).not.toHaveBeenCalled();
    });
  });

  describe("getUserStats", () => {
    it("scopes stats to selectedLanguage when set", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("en");
      q.getUserStats.mockResolvedValue({
        totalWords: 10,
        masteredWords: 3,
        learningWords: 4,
      });
      const stats = await api.getUserStats();
      expect(q.getUserStats).toHaveBeenCalledWith("en");
      expect(stats.masteredWords).toBe(3);
    });
  });
});
