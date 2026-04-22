import { render } from '@testing-library/react-native';
import React from 'react';

import ProfileScreen from '@/app/(tabs)/profile';
import SelectLanguageScreen from '@/app/auth/select-language';
import IndexScreen from '@/app/index';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    router: { push: jest.fn(), replace: jest.fn() },
    Link: ({ children }: any) => children,
    Stack: { Screen: () => null },
    Tabs: { Screen: () => null },
    useFocusEffect: (callback: any) => React.useEffect(callback, []),
    useSegments: () => ['(tabs)'],
  };
});

jest.mock('@/services/api', () => ({
  api: {
    getMe: jest.fn().mockResolvedValue({
      _id: 'local-device',
      name: 'Learner',
      selectedLanguage: 'en',
    }),
    saveLanguage: jest.fn().mockResolvedValue({ language: 'en' }),
    resetAllProgress: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/i18n', () => ({
  __esModule: true,
  default: { locale: 'en', t: (k: string) => k },
  getLocale: jest.fn().mockResolvedValue('en'),
  setLocale: jest.fn(),
}));

describe('Screen smoke tests', () => {
  it('renders the Index splash screen', () => {
    const { toJSON } = render(<IndexScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Select Language screen', () => {
    const { toJSON } = render(<SelectLanguageScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Profile screen and shows the Learner name', async () => {
    const { toJSON, findByText } = render(<ProfileScreen />);

    const nameText = await findByText('Learner');
    expect(nameText).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });
});
