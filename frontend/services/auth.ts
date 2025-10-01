import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const redirectUri = Linking.createURL('auth/callback'); 

WebBrowser.maybeCompleteAuthSession();

export const loginWithGoogle = async () => {
  try {
    const result = await WebBrowser.openAuthSessionAsync(
      `${API_URL}/auth/google`,
      redirectUri
    );

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const token = url.searchParams.get('token');

      if (token) {
        await AsyncStorage.setItem('authToken', token);
        return { success: true, token };
      }
    }

    return { success: false, error: 'authentication failed' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'authentication error' };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('authToken');
};

export const getToken = async () => {
  return await AsyncStorage.getItem('authToken');
};