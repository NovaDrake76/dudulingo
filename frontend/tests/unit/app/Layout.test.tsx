import RootLayout from '@/app/_layout';
import { render, waitFor } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

const Stack = ({ children }: any) => <>{children}</>;
const StackScreen = () => null;
Stack.Screen = StackScreen;

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    Stack: Stack,
    Slot: jest.fn(() => null),
  };
});

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/bootstrap', () => ({
  bootstrap: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/i18n', () => ({
  __esModule: true,
  default: { locale: 'en', t: (k: string) => k },
  getLocale: jest.fn().mockResolvedValue('en'),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

import { bootstrap } from '@/services/bootstrap';

describe('RootLayout (offline MVP)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs bootstrap and hides the splash screen on mount', async () => {
    render(<RootLayout />);

    await waitFor(() => {
      expect(bootstrap).toHaveBeenCalled();
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
  });

  it('still hides the splash screen and renders an error UI if bootstrap throws', async () => {
    (bootstrap as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    const { findByText } = render(<RootLayout />);

    await waitFor(() => {
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
    const errorHeading = await findByText('Startup failed');
    expect(errorHeading).toBeTruthy();
  });
});
