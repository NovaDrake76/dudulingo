import RootLayout, { useAuth } from '@/app/_layout';
import { api } from '@/services/api';
import * as Auth from '@/services/auth';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { Button, Text, View } from 'react-native';

const Stack = ({ children }: any) => <>{children}</>;
const StackScreen = () => null;
Stack.Screen = StackScreen;

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    Stack: Stack,
    useRouter: jest.fn(),
    useSegments: jest.fn(),
    Slot: jest.fn(() => null),
  };
});

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  api: {
    getMe: jest.fn(),
  },
}));

jest.mock('@/services/auth', () => ({
  getToken: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('@/services/i18n', () => ({
  getLocale: jest.fn().mockResolvedValue('en'),
  t: (k: string) => k,
  locale: 'en',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('RootLayout Integration', () => {
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
    (useSegments as jest.Mock).mockReturnValue([]);
  });

  it('renders correctly and hides splash screen on mount', async () => {
    (Auth.getToken as jest.Mock).mockResolvedValue(null);

    render(<RootLayout />);

    await waitFor(() => {
      expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });

  describe('Authentication Flow', () => {
    it('redirects to sign-in if no token is found', async () => {
      (Auth.getToken as jest.Mock).mockResolvedValue(null);
      (useSegments as jest.Mock).mockReturnValue([]);

      render(<RootLayout />);

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith('/auth/sign-in');
      });
    });

    it('does not redirect to sign-in if already in auth group', async () => {
      (Auth.getToken as jest.Mock).mockResolvedValue(null);
      (useSegments as jest.Mock).mockReturnValue(['auth']);

      render(<RootLayout />);

      await waitFor(() => {
        expect(SplashScreen.hideAsync).toHaveBeenCalled();
      });

      expect(replaceMock).not.toHaveBeenCalledWith('/auth/sign-in');
    });
  });

  describe('Session Handling', () => {
    it('redirects to Learn tab if user has selected language', async () => {
      (Auth.getToken as jest.Mock).mockResolvedValue('valid-token');
      (api.getMe as jest.Mock).mockResolvedValue({
        selectedLanguage: 'pt-BR',
      });

      render(<RootLayout />);

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith('/(tabs)/learn');
      });
    });

    it('redirects to Select Language if user has NO language', async () => {
      (Auth.getToken as jest.Mock).mockResolvedValue('valid-token');
      (api.getMe as jest.Mock).mockResolvedValue({
        selectedLanguage: null,
      });

      render(<RootLayout />);

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith('/auth/select-language');
      });
    });

    it('logs out and redirects to sign-in on API error', async () => {
      (Auth.getToken as jest.Mock).mockResolvedValue('invalid-token');
      (api.getMe as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      render(<RootLayout />);

      await waitFor(() => {
        expect(Auth.logout).toHaveBeenCalled();
        expect(replaceMock).toHaveBeenCalledWith('/auth/sign-in');
      });
    });
  });

  describe('AuthContext', () => {
    const TestComponent = () => {
      const { setToken, isAuthenticated } = useAuth();
      return (
        <View>
          <Text>{isAuthenticated ? 'Logged In' : 'Logged Out'}</Text>
          <Button
            title="Login"
            onPress={() => setToken('new-token')}
            testID="login-btn"
          />
          <Button
            title="Logout"
            onPress={() => setToken(null)}
            testID="logout-btn"
          />
        </View>
      );
    };

    jest.mock('expo-router', () => ({
        Stack: ({ children }: any) => <>{children}<TestComponent /></>,
        useRouter: jest.fn(),
        useSegments: jest.fn(),
    }));

    it('initializes authenticated state correctly', async () => {
        (Auth.getToken as jest.Mock).mockResolvedValue('stored-token');
        (api.getMe as jest.Mock).mockResolvedValue({ selectedLanguage: 'en' });

        render(<RootLayout />);

        await waitFor(() => {
            expect(api.getMe).toHaveBeenCalled();
        });
    });
  });
});