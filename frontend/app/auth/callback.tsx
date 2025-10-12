import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../_layout';

export default function AuthCallback() {
  const { token } = useLocalSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const handleToken = async () => {
      if (typeof token === 'string' && token) {
        await setToken(token);
        router.replace('/auth/select-language');
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
