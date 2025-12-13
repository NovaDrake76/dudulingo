import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import SignInScreen from '@/app/auth/sign-in';
import { loginWithGoogle } from '@/services/auth';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do alert global que o componente usa
global.alert = jest.fn();

jest.mock('@/services/auth', () => ({
  loginWithGoogle: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/services/i18n', () => ({
  t: (key: string) => key,
  locale: 'en',
  setLocale: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  Link: ({ children }: any) => children,
}));

jest.mock('@/components/icons/GoogleIcon', () => 'GoogleIcon');

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls loginWithGoogle when button is pressed', async () => {
    const { getByText } = render(<SignInScreen />);
    
    // Com o mock do i18n, o texto será a própria chave
    const loginButton = getByText('continueWithGoogle');
    fireEvent.press(loginButton);

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('handles login failure gracefully', async () => {
    (loginWithGoogle as jest.Mock).mockResolvedValue({ success: false, error: 'Failed' });
    const { getByText } = render(<SignInScreen />);
    
    const loginButton = getByText('continueWithGoogle');
    fireEvent.press(loginButton);

    expect(loginWithGoogle).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });
});