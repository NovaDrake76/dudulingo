import "react-native-gesture-handler";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { toastConfig } from "../components/ToastConfig";
import { AppColors } from "../constants/theme";
import { bootstrap } from "../services/bootstrap";
import i18n, { getLocale } from "../services/i18n";
import logger from "../services/logger";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerTransparent: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/select-language"
        options={{ title: i18n.t("selectLanguageTitle") }}
      />
      <Stack.Screen
        name="select-deck"
        options={{ title: i18n.t("selectDeckTitle") }}
      />
      <Stack.Screen name="review/[deckId]" options={{ title: "Review" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const setupRan = useRef(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (setupRan.current) return;
    setupRan.current = true;

    (async () => {
      try {
        i18n.locale = await getLocale();
        await bootstrap();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error("Bootstrap failed", { error: msg });
        setBootError(msg);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={AppColors.primary} />
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
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: AppColors.background,
  },
  errorTitle: {
    color: AppColors.danger,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  errorBody: {
    color: AppColors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
