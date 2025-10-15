import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../_layout';

export default function AuthCallback() {
  const { token } = useLocalSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const handleToken = async () => {
      if (typeof token === 'string' && token) {
        await setToken(token);
        try {
          const user = await api.getMe();
          if (user && user.selectedLanguage) {
            router.replace('/(tabs)/learn');
          } else {
            router.replace('/auth/select-language');
          }
        } catch (error) {
          console.error('Failed to fetch user data, redirecting to sign-in:', error);
          router.replace('/auth/sign-in');
        }
      } else {
        router.replace('/auth/sign-in');
      }
    };

    handleToken();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}