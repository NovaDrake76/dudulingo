import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppColors } from '../../constants/theme';
import { api } from '../../services/api';
import logger from '../../services/logger';
import { useAuth } from '../_layout';

export default function AuthCallback() {
  const { token } = useLocalSearchParams();
  const { setToken } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleToken = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

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
          logger.error('Failed to fetch user data, redirecting to sign-in', { error: String(error) });
          await setToken(null);
          router.replace('/auth/sign-in');
        }
      } else {
        router.replace('/auth/sign-in');
      }
    };

    handleToken();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background }}>
      <ActivityIndicator size="large" color={AppColors.primary} />
    </View>
  );
}
