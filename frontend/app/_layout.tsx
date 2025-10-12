import 'react-native-gesture-handler';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n, { getLocale } from '../services/i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadLocale = async () => {
      const locale = await getLocale();
      i18n.locale = locale;
      setLoaded(true);
      SplashScreen.hideAsync();
    };

    if (!loaded) {
      loadLocale();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/select-language" options={{ title: i18n.t('selectLanguageTitle') }} />
        <Stack.Screen name="select-deck" options={{ title: i18n.t('selectDeckTitle') }} />
        <Stack.Screen name="review/[deckId]" options={{ title: 'Review' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}