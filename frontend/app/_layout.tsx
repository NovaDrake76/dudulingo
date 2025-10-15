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

  // This is the centralized logic to decide where an authenticated user should go.
  const handleUserSession = async () => {
    try {
      const user = await api.getMe();
      if (user && user.selectedLanguage) {
        // If language is selected, they are ready for the main app.
        // The learn screen will handle prompting them to select a deck if needed.
        router.replace("/(tabs)/learn");
      } else {
        // If no language is selected, they must go through the setup flow.
        router.replace("/auth/select-language");
      }
    } catch (error) {
      console.error("Failed to fetch user data, logging out:", error);
      // If fetching the user fails (e.g., bad token), log them out.
      await setToken(null);
      router.replace('/auth/sign-in');
    }
  };

  useEffect(() => {
    async function setup() {
      SplashScreen.preventAutoHideAsync();
      try {
        const token = await getToken();
        if (token) {
          setIsAuthenticated(true);
          // On app startup, handle the user session immediately.
          await handleUserSession();
        } else {
          setIsAuthenticated(false);
          // If no token, the protected route hook will redirect to sign-in.
        }
        const locale = await getLocale();
        i18n.locale = locale;
      } catch (e) {
        console.error("Error setting up root layout:", e);
        await setToken(null); // Logout on any critical error
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
    <AuthContext.Provider value={{ isAuthenticated, setToken, handleUserSession }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}