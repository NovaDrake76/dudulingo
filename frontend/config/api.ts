const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const apiConfig = {
  baseUrl: API_URL,
  auth: {
    googleLogin: `${API_URL}/auth/google`,
  },
};