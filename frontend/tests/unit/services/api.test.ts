import { api } from '@/services/api';
import * as Auth from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('@/services/auth', () => ({
  getToken: jest.fn(),
}));

global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Auth Methods', () => {
    it('saveAuthToken should store token in AsyncStorage', async () => {
      await api.saveAuthToken('test-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
    });

    it('checkAuth should return true if token exists', async () => {
      (Auth.getToken as jest.Mock).mockResolvedValue('valid-token');
      const result = await api.checkAuth();
      expect(result).toBe(true);
    });

    it('checkAuth should return false if token is null', async () => {
      (Auth.getToken as jest.Mock).mockResolvedValue(null);
      const result = await api.checkAuth();
      expect(result).toBe(false);
    });
  });

  describe('Authenticated Requests', () => {
    beforeEach(() => {
      (Auth.getToken as jest.Mock).mockResolvedValue('fake-jwt');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });
    });

    it('should include Authorization header when token exists', async () => {
      await api.getMe();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-jwt',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw error when API returns non-200 status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue('Error details'),
      });

      await expect(api.getMe()).rejects.toThrow('API error: Unauthorized');
    });

    it('saveLanguage calls correct endpoint', async () => {
      await api.saveLanguage('pt-BR');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/language'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ language: 'pt-BR' }) })
      );
    });

    it('submitReview calls correct endpoint', async () => {
      await api.submitReview('card-123', 'good');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/review'),
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ cardId: 'card-123', rating: 'good' }) })
      );
    });

    it('addDeckToUser calls correct endpoint', async () => {
        await api.addDeckToUser('deck-1');
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/users/decks/deck-1'),
          expect.objectContaining({ method: 'POST' })
        );
      });
  
      it('getUserStats calls correct endpoint', async () => {
        await api.getUserStats();
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/stats'), expect.anything());
      });
  
      it('getAllDecks calls correct endpoint', async () => {
        await api.getAllDecks();
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/decks'), expect.anything());
      });
  
      it('getDeck calls correct endpoint', async () => {
        await api.getDeck('deck-1');
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/decks/deck-1'), expect.anything());
      });
  
      it('getGeneralReviewSession calls correct endpoint', async () => {
        await api.getGeneralReviewSession();
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/review/session/general'), expect.anything());
      });
  
      it('getDeckReviewSession calls correct endpoint', async () => {
        await api.getDeckReviewSession('deck-1');
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/review/deck/deck-1'), expect.anything());
      });
  });
});