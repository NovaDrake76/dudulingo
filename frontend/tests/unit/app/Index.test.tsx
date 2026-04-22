import Index from '@/app/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Capture the `href` argument so we can assert on it.
const mockRedirect = jest.fn();
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
}));

describe('Index routing decision', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to the learn tab when a language is already selected', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('en');

    render(<Index />);

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/(tabs)/learn');
    });
  });

  it('redirects to select-language when no language is stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    render(<Index />);

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/auth/select-language');
    });
  });

  it('renders a spinner while the AsyncStorage read is pending', () => {
    (AsyncStorage.getItem as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { toJSON } = render(<Index />);
    expect(toJSON()).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
