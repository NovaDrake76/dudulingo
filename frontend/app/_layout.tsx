import 'react-native-gesture-handler';

import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_600SemiBold,
  InterTight_700Bold,
  useFonts,
} from '@expo-google-fonts/inter-tight';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { toastConfig } from '../components/ToastConfig';
import { Theme } from '../constants/theme';
import { bootstrap } from '../services/bootstrap';
import i18n, { getLocale } from '../services/i18n';
import logger from '../services/logger';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: false,
        contentStyle: { backgroundColor: Theme.paper },
        headerStyle: { backgroundColor: Theme.paper },
        headerTitleStyle: {
          fontFamily: 'InterTight_600SemiBold',
          fontSize: 15,
          color: Theme.ink,
        },
        headerTintColor: Theme.ink,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/select-language"
        options={{ headerShown: false, title: i18n.t('selectLanguageTitle') }}
      />
      <Stack.Screen
        name="select-deck"
        options={{ headerShown: false, title: i18n.t('selectDeckTitle') }}
      />
      <Stack.Screen name="review/[deckId]" options={{ headerShown: false, title: 'Review' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const setupRan = useRef(false);
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    InterTight_700Bold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (setupRan.current) return;
    setupRan.current = true;

    (async () => {
      try {
        i18n.locale = await getLocale();
        await bootstrap();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error('Bootstrap failed', { error: msg });
        setBootError(msg);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Theme.ink} />
      </View>
    );
  }

  if (bootError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.errorTitle}>Startup failed</Text>
        <Text style={styles.errorBody}>{bootError}</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="dark" />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Theme.paper,
  },
  errorTitle: {
    color: Theme.rose,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorBody: {
    color: Theme.inkMute,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
