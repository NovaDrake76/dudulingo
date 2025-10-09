import 'react-native-gesture-handler';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="auth/select-language" options={{ title: 'Select Language' }} />
        <Stack.Screen name="select-deck" options={{ title: 'Select Deck' }} />
        <Stack.Screen name="review/[deckId]" options={{ title: 'Review' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}