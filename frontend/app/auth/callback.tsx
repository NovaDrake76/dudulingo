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
        // After setting the token, navigate to the first step of onboarding.
        router.replace('/auth/select-language');
      } else {
        // If no token is found, something went wrong, so return to the sign-in screen.
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