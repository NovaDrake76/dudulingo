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
  useState,
} from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getToken, logout } from "../services/auth";
import i18n, { getLocale } from "../services/i18n";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  setToken: (token: string | null) => Promise<void>;
} | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!segments || segments.every(segment => !segment)) {
      return;
    }

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/sign-in");
    } else if (isAuthenticated && segments.join('/') === 'auth/sign-in') {
      router.replace("/(tabs)/learn");
    }
  }, [isAuthenticated, segments, router]);
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  useProtectedRoute(isAuthenticated);

  return (
    <Stack>
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
      <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function setup() {
      SplashScreen.preventAutoHideAsync();
      try {
        const token = await getToken();
        if (token) {
          setIsAuthenticated(true);
        }
        const locale = await getLocale();
        i18n.locale = locale;
      } catch (e) {
        console.error("Error setting up root layout:", e);
      } finally {
        setLoading(false);
        await SplashScreen.hideAsync();
      }
    }
    setup();
  }, []);

  const setToken = async (token: string | null) => {
    if (token) {
      await AsyncStorage.setItem("authToken", token);
      setIsAuthenticated(true);
    } else {
      await logout();
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setToken }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}