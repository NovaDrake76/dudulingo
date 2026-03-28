import "react-native-gesture-handler";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { toastConfig } from "../components/ToastConfig";
import { api } from "../services/api";
import { getToken, logout } from "../services/auth";
import i18n, { getLocale } from "../services/i18n";
import logger from "../services/logger";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  loading: boolean;
  setToken: (token: string | null) => Promise<void>;
  handleUserSession: () => Promise<void>;
} | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function useProtectedRoute(isAuthenticated: boolean, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/sign-in");
    }
  }, [isAuthenticated, loading, segments, router]);
}

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  useProtectedRoute(isAuthenticated, loading);

  return (
    <Stack screenOptions={{ headerTransparent: false, headerBlurEffect: undefined }}>
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
      <Stack.Screen
        name="add-card"
        options={{ title: i18n.t("createCard") }}
      />
      <Stack.Screen
        name="create-deck"
        options={{ title: i18n.t("createDeck") }}
      />
      <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigatingRef = useRef(false);
  const setupRan = useRef(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const setToken = async (token: string | null) => {
    if (token) {
      await AsyncStorage.setItem("authToken", token);
      setIsAuthenticated(true);
    } else {
      await logout();
      setIsAuthenticated(false);
    }
  };

  const handleUserSession = async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    try {
      const user = await api.getMe();
      if (user && user.selectedLanguage) {
        router.replace("/(tabs)/learn");
      } else {
        router.replace("/auth/select-language");
      }
    } catch (error) {
      logger.error("Failed to fetch user data, logging out", { error: String(error) });
      await setToken(null);
      router.replace("/auth/sign-in");
    } finally {
      // Reset after a short delay to allow navigation to settle
      setTimeout(() => { navigatingRef.current = false; }, 1000);
    }
  };

  useEffect(() => {
    if (setupRan.current) return;
    setupRan.current = true;

    async function setup() {
      SplashScreen.preventAutoHideAsync();
      try {
        const locale = await getLocale();
        i18n.locale = locale;

        const token = await getToken();
        if (token) {
          setIsAuthenticated(true);
          await handleUserSession();
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        logger.error("Error setting up root layout", { error: String(e) });
        await setToken(null);
      } finally {
        setLoading(false);
        await SplashScreen.hideAsync();
      }
    }
    setup();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ isAuthenticated, loading, setToken, handleUserSession }}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
          <StatusBar style="auto" />
          <Toast config={toastConfig} />
        </ThemeProvider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
