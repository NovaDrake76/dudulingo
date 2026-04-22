import LearnScreen from '@/app/(tabs)/learn';
import { api } from '@/services/api';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: jest.fn() },
    useFocusEffect: (cb: any) => React.useEffect(cb, []),
  };
});

jest.mock('@/services/api', () => ({
  api: {
    getUserStats: jest.fn(),
  },
}));

jest.mock('@/services/i18n', () => ({
  t: (key: string) => key,
}));

describe('LearnScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the deck picker when "Browse decks" is pressed', async () => {
    (api.getUserStats as jest.Mock).mockResolvedValue({
      totalWords: 10,
      masteredWords: 0,
      learningWords: 10,
    });

    const { findByText } = render(<LearnScreen />);

    const browseButton = await findByText('Browse decks');
    fireEvent.press(browseButton);

    expect(router.push).toHaveBeenCalledWith('/select-deck');
  });

  it('still shows the deck picker entry when the user has no progress yet', async () => {
    (api.getUserStats as jest.Mock).mockResolvedValue({
      totalWords: 0,
      masteredWords: 0,
      learningWords: 0,
    });

    const { findByText } = render(<LearnScreen />);

    expect(await findByText('Browse decks')).toBeTruthy();
  });
});
