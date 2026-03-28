import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "./auth";
import logger from "./logger";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

// generic fetch with auth
const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = await getToken();
  const url = `${API_URL}${endpoint}`;
  const method = options.method || "GET";

  logger.debug(`API request: ${method} ${url}`);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    logger.error(`Network error: ${method} ${url}`, { error: String(err) });
    throw err;
  }

  logger.debug(`API response: ${method} ${url} ${response.status}`);

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error("API error response", { status: response.status, url, body: errorBody });
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  // auth
  async saveAuthToken(token: string) {
    await AsyncStorage.setItem("authToken", token);
  },

  async checkAuth() {
    const token = await getToken();
    return !!token;
  },

  // user endpoints
  async saveLanguage(language: string) {
    return authenticatedFetch("/users/language", {
      method: "POST",
      body: JSON.stringify({ language }),
    });
  },

  async addDeckToUser(deckId: string) {
    return authenticatedFetch(`/users/decks/${deckId}`, {
      method: "POST",
    });
  },

  async getUserStats() {
    return authenticatedFetch("/users/stats");
  },

  async getMe() {
    return authenticatedFetch("/users/me");
  },

  // decks endpoints
  async getAllDecks() {
    const result = await authenticatedFetch("/decks?limit=100");
    return result.data || result;
  },

  async getDeck(deckId: string) {
    return authenticatedFetch(`/decks/${deckId}`);
  },

  // review endpoints
  async getGeneralReviewSession() {
    return authenticatedFetch("/review/session/general");
  },

  async getDeckReviewSession(deckId: string) {
    return authenticatedFetch(`/review/deck/${deckId}`);
  },

  async submitReview(cardId: string, rating: string) {
    return authenticatedFetch("/review", {
      method: "POST",
      body: JSON.stringify({ cardId, rating }),
    });
  },

  // card management
  async createCard(data: {
    type: string;
    prompt: string;
    answer: string;
    imageUrl?: string;
    imageSource?: string;
    imageLicense?: string;
    lang?: string;
    deckId?: string;
  }) {
    return authenticatedFetch("/cards", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createDeck(data: { name: string; description?: string }) {
    return authenticatedFetch("/decks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async searchImages(query: string) {
    return authenticatedFetch(
      `/images/search?query=${encodeURIComponent(query)}`
    );
  },
};
