import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

jest.mock("expo-linking", () => ({
  createURL: jest.fn((path) => `exp://test-url/${path}`),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

import { getToken, loginWithGoogle, logout } from "@/services/auth";

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginWithGoogle", () => {
    it("should return success when auth session is successful on mobile", async () => {
      Platform.OS = "ios";

      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: "success",
        url: "exp://test-url/auth/callback",
      });

      const result = await loginWithGoogle();

      expect(result).toEqual({ success: true });
    });

    it("should return error when auth session is cancelled", async () => {
      Platform.OS = "ios";
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: "cancel",
      });

      const result = await loginWithGoogle();

      expect(result).toEqual({
        success: false,
        error: "Authentication was cancelled or failed.",
      });
    });
  });

  describe("Session Management", () => {
    it("should retrieve token from storage", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("fake-token");

      const token = await getToken();

      expect(token).toBe("fake-token");
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("authToken");
    });

    it("should remove all auth related items on logout", async () => {
      await logout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("authToken");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("selectedLanguage");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("selectedDeck");
    });
  });
});
