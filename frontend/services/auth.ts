import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const redirectUri = Linking.createURL('auth/callback');

WebBrowser.maybeCompleteAuthSession();

export const loginWithGoogle = async () => {
  try {
    // We will pass the redirect URI to the backend via the `state` parameter.
    // This tells the backend exactly where to send the user back after login.
    const state = Buffer.from(JSON.stringify({ redirectUri })).toString('base64');
    const authUrl = `${API_URL}/auth/google?state=${encodeURIComponent(state)}`;

    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      redirectUri
    );

    if (result.type !== 'success') {
      return { success: false, error: 'Authentication was cancelled or failed.' };
    }

    // If successful, Expo Router will handle the deep link and navigate to the callback screen.
    return { success: true };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['authToken', 'selectedLanguage', 'selectedDeck']);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('authToken');
};