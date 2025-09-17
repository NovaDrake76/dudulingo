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

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
})

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      SplashScreen.hideAsync();
    }
  }
  , [loaded]);



  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
