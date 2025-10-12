import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'

// get auth token from storage
const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('authToken')
}

// generic fetch with auth
const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  // auth
  async saveAuthToken(token: string) {
    await AsyncStorage.setItem('authToken', token)
  },

  async logout() {
    await AsyncStorage.removeItem('authToken')
    await AsyncStorage.removeItem('selectedLanguage')
    await AsyncStorage.removeItem('selectedDeck')
  },

  async checkAuth() {
    const token = await getAuthToken()
    return !!token
  },

  // user endpoints
  async saveLanguage(language: string) {
    return authenticatedFetch('/users/language', {
      method: 'POST',
      body: JSON.stringify({ language }),
    })
  },

  async addDeckToUser(deckId: string) {
    return authenticatedFetch(`/users/decks/${deckId}`, {
      method: 'POST',
    })
  },

  async getUserStats() {
    return authenticatedFetch('/users/stats')
  },

  // decks endpoints
  async getAllDecks() {
    return authenticatedFetch('/decks')
  },

  async getDeck(deckId: string) {
    return authenticatedFetch(`/decks/${deckId}`)
  },

  // review endpoints
  async getGeneralReviewSession() {
    return authenticatedFetch('/review/session/general')
  },

  async getDeckReviewSession(deckId: string) {
    return authenticatedFetch(`/review/deck/${deckId}`)
  },

  async submitReview(cardId: string, rating: string) {
    return authenticatedFetch('/review', {
      method: 'POST',
      body: JSON.stringify({ cardId, rating }),
    })
  },
}