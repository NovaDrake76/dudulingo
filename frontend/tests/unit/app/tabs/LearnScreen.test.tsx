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


  it('navigates to general review when "Start Review" is pressed', async () => {
    (api.getUserStats as jest.Mock).mockResolvedValue({
      totalWords: 10,
      masteredWords: 0,
      learningWords: 10,
    });

    const { findByText } = render(<LearnScreen />);

    const startButton = await findByText('startReview');
    fireEvent.press(startButton);

    expect(router.push).toHaveBeenCalledWith('../review/general');
  });

  it('navigates to deck selection when "Add New Deck" is pressed', async () => {
    (api.getUserStats as jest.Mock).mockResolvedValue({
      totalWords: 10, 
      masteredWords: 0,
      learningWords: 10,
    });

    const { findByText } = render(<LearnScreen />);

    const addButton = await findByText('addNewDeck');
    fireEvent.press(addButton);

    expect(router.push).toHaveBeenCalledWith('/select-deck');
  });

  it('shows empty state and hides review button when user has no words', async () => {
    (api.getUserStats as jest.Mock).mockResolvedValue({
      totalWords: 0,
      masteredWords: 0,
      learningWords: 0,
    });

    const { findByText, queryByText } = render(<LearnScreen />);

    expect(await findByText('noDecks')).toBeTruthy();
    expect(await findByText('noDecksSubtitle')).toBeTruthy();

    expect(queryByText('startReview')).toBeNull();
  });
});