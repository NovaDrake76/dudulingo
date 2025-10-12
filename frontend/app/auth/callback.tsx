import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { api } from '../../services/api';

export default function AuthCallback() {
  const { token } = useLocalSearchParams();

  useEffect(() => {
    const handleToken = async () => {
      if (typeof token === 'string') {
        await api.saveAuthToken(token);
        
        // garantir que o usuário está totalmente integrado
        const selectedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (!selectedLanguage) {
          router.replace('/auth/select-language');
          return;
        }

        const selectedDeck = await AsyncStorage.getItem('selectedDeck');
        if (!selectedDeck) {
          router.replace('/select-deck');
          return;
        }
        
        router.replace('/(tabs)/learn');
      } else {
        // se nenhum token for encontrado, volte para a tela de login
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