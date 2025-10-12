import { Buffer } from 'buffer';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const redirectUri = Linking.createURL('auth/callback');

WebBrowser.maybeCompleteAuthSession();

export const loginWithGoogle = async () => {
  try {
    let redirect: string;

    if (Platform.OS === 'web') {
      redirect = `${window.location.origin}/auth/callback`;
    } else {
      redirect = redirectUri;
    }

    const state = Buffer.from(JSON.stringify({ redirectUri: redirect })).toString('base64');
    const authUrl = `${API_URL}/auth/google?state=${encodeURIComponent(state)}`;

    if (Platform.OS === 'web') {
      window.location.href = authUrl;
      return { success: true };
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') {
      return { success: false, error: 'Authentication was cancelled or failed.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
};
