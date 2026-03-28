import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import logger from "./logger";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const redirectUri = Linking.createURL("auth/callback");

WebBrowser.maybeCompleteAuthSession();

export const loginWithGoogle = async () => {
  try {
    let redirect: string;

    if (Platform.OS === "web") {
      redirect = `${window.location.origin}/auth/callback`;
    } else {
      redirect = redirectUri;
    }

    const state = Buffer.from(
      JSON.stringify({ redirectUri: redirect }),
    ).toString("base64");
    const authUrl = `${API_URL}/auth/google?state=${encodeURIComponent(state)}`;

    if (Platform.OS === "web") {
      window.location.href = authUrl;
      return { success: true };
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== "success") {
      return {
        success: false,
        error: "Authentication was cancelled or failed.",
      };
    }

    return { success: true };
  } catch (error) {
    logger.error("Google login error", { error: String(error) });
    return { success: false, error: "An unexpected error occurred." };
  }
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("authToken");
};

export const logout = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("selectedLanguage");
  await AsyncStorage.removeItem("selectedDeck");
};
