import { render } from '@testing-library/react-native';
import React from 'react';

import ProfileScreen from '@/app/(tabs)/profile';
import SelectLanguageScreen from '@/app/auth/select-language';
import SignInScreen from '@/app/auth/sign-in';
import IndexScreen from '@/app/index';

jest.mock('expo-router', () => {
  const React = require('react'); 
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    Link: ({ children }: any) => children,
    Stack: { Screen: () => null },
    Tabs: { Screen: () => null },
    useFocusEffect: (callback: any) => React.useEffect(callback, []),
    useSegments: () => ['(tabs)'],
  };
});

jest.mock('@/services/auth', () => ({
  loginWithGoogle: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn().mockResolvedValue('dummy-token'),
}));

jest.mock('@/services/api', () => ({
  api: {
    getMe: jest.fn().mockResolvedValue({
      _id: '123',
      name: 'Test User',
      photoUrl: null,
      selectedLanguage: 'en',
    }),
  },
}));

jest.mock('../../../app/_layout', () => ({
  useAuth: () => ({
    setToken: jest.fn(),
    isAuthenticated: true,
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@/services/i18n', () => ({
  getLocale: jest.fn().mockResolvedValue('en'),
  setLocale: jest.fn(),
  t: (key: string) => key,
  locale: 'en',
}));

describe('Screens Smoke Tests', () => {
  it('renders Index screen', () => {
    const { toJSON } = render(<IndexScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders Sign In screen', () => {
    const { toJSON } = render(<SignInScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders Select Language screen', () => {
    const { toJSON } = render(<SelectLanguageScreen />);
    expect(toJSON()).toBeTruthy();
  });
  
  it('renders Profile screen and loads user data', async () => {
      const { toJSON, findByText } = render(<ProfileScreen />);
      
      const userText = await findByText('Test User');
      expect(userText).toBeTruthy();
      
      expect(toJSON()).toBeTruthy();
  });
});