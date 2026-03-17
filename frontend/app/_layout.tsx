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
import { api } from "../services/api";
import { getToken, logout } from "../services/auth";
import i18n, { getLocale } from "../services/i18n";

// We expand the context to include a function to handle the session
const AuthContext = createContext<{
  isAuthenticated: boolean;
  setToken: (token: string | null) => Promise<void>;
  handleUserSession: () => Promise<void>; // New function to handle redirects
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
    // useSegments always returns at least one segment, so we can read segments[0] directly.
    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/sign-in");
    }
  }, [isAuthenticated, segments, router]);
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  useProtectedRoute(isAuthenticated);

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
      <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
      {/* The callback screen is now handled cleanly */}
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const setupRan = React.useRef(false);

  const setToken = async (token: string | null) => {
    if (token) {
      await AsyncStorage.setItem("authToken", token);
      setIsAuthenticated(true);
    } else {
      await logout();
      setIsAuthenticated(false);
    }
  };

  // This is the centralized logic to decide where an authenticated user should go.
  const handleUserSession = async () => {
    try {
      const user = await api.getMe();
      if (user && user.selectedLanguage) {
        router.replace("/(tabs)/learn");
      } else {
        router.replace("/auth/select-language");
      }
    } catch (error) {
      console.error("Failed to fetch user data, logging out:", error);
      await logout();
      setIsAuthenticated(false);
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
        }
      } catch (e) {
        console.error("Error setting up root layout:", e);
        await logout();
        setIsAuthenticated(false);
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
    <AuthContext.Provider value={{ isAuthenticated, setToken, handleUserSession }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}