import ReviewScreen from '@/app/review/[deckId]';
import { api } from '@/services/api';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert } from 'react-native';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@/services/api', () => ({
  api: {
    getGeneralReviewSession: jest.fn(),
    getDeckReviewSession: jest.fn(),
    submitReview: jest.fn(),
  },
}));

jest.mock('@/services/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.spyOn(Alert, 'alert');

describe('ReviewScreen Integration', () => {
  const mockCards = [
    {
      cardId: 'card-1',
      questionType: 'selection_mc',
      correctAnswer: 'Gato',
      word: 'Cat',
      options: ['Gato', 'Cão', 'Pássaro'],
      feedback: {
        word: 'Cat',
        translation: 'Gato',
      },
    },
    {
      cardId: 'card-2',
      questionType: 'type_answer',
      correctAnswer: 'Dog',
      word: 'Cão',
      prompt: 'Translate this',
      feedback: {
        word: 'Cão',
        translation: 'Dog',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ deckId: 'deck-123' });
  });

  it('renders loading state initially', () => {
    (api.getDeckReviewSession as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    const { UNSAFE_getByType } = render(<ReviewScreen />);
    
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('loads session data and renders the first card correctly', async () => {
    (api.getDeckReviewSession as jest.Mock).mockResolvedValue({ cards: mockCards });

    const { findAllByText } = render(<ReviewScreen />);

    const cats = await findAllByText('Cat');
    expect(cats.length).toBeGreaterThan(0);

    const gatos = await findAllByText('Gato');
    expect(gatos.length).toBeGreaterThan(0);

    const caos = await findAllByText('Cão');
    expect(caos.length).toBeGreaterThan(0);
  });

  it('handles correct answer selection in multiple choice', async () => {
    (api.getDeckReviewSession as jest.Mock).mockResolvedValue({ cards: [mockCards[0]] });

    const { findAllByText, getByText } = render(<ReviewScreen />);

    const correctOptions = await findAllByText('Gato');
    const optionButton = correctOptions[correctOptions.length - 1];
    fireEvent.press(optionButton);

    expect(getByText('next')).toBeTruthy();
    
    fireEvent.press(getByText('next'));

    await waitFor(() => {
      expect(api.submitReview).toHaveBeenCalledWith('card-1', 'easy');
    });
  });

  it('handles incorrect answer selection in multiple choice', async () => {
    (api.getDeckReviewSession as jest.Mock).mockResolvedValue({ cards: [mockCards[0]] });

    const { findByText, getByText } = render(<ReviewScreen />);

    const wrongOption = await findByText('Cão');
    fireEvent.press(wrongOption);

    expect(getByText('next')).toBeTruthy();

    fireEvent.press(getByText('next'));

    await waitFor(() => {
      expect(api.submitReview).toHaveBeenCalledWith('card-1', 'very_hard');
    });
  });

  it('handles typed answer input and validation', async () => {
    (api.getDeckReviewSession as jest.Mock).mockResolvedValue({ cards: [mockCards[1]] });

    const { findByPlaceholderText, findByText, getByText } = render(<ReviewScreen />);

    const input = await findByPlaceholderText('typeYourAnswer');
    fireEvent.changeText(input, 'Dog');

    const checkButton = await findByText('checkAnswer');
    fireEvent.press(checkButton);

    expect(getByText('next')).toBeTruthy();

    fireEvent.press(getByText('next'));

    await waitFor(() => {
      expect(api.submitReview).toHaveBeenCalledWith('card-2', 'easy');
    });
  });

  it('navigates back if session is empty', async () => {
    (api.getDeckReviewSession as jest.Mock).mockResolvedValue({ cards: [] });

    render(<ReviewScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'allDone',
        'noCardsToReview',
        expect.any(Array)
      );
    });

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    alertButtons[0].onPress();

    expect(router.back).toHaveBeenCalled();
  });

  it('completes the session and navigates to learn screen', async () => {
    (api.getDeckReviewSession as jest.Mock).mockResolvedValue({ cards: [mockCards[0]] });

    const { findAllByText, getByText } = render(<ReviewScreen />);

    const correctOptions = await findAllByText('Gato');
    const optionButton = correctOptions[correctOptions.length - 1];
    fireEvent.press(optionButton);
    
    fireEvent.press(getByText('next'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Session Complete!',
        "You've finished this review session.",
        expect.any(Array)
      );
    });

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    alertButtons[0].onPress();

    expect(router.replace).toHaveBeenCalledWith('/(tabs)/learn');
  });

  it('uses general review endpoint when deckId is general', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ deckId: 'general' });
    (api.getGeneralReviewSession as jest.Mock).mockResolvedValue({ cards: mockCards });

    render(<ReviewScreen />);

    await waitFor(() => {
      expect(api.getGeneralReviewSession).toHaveBeenCalled();
    });
  });
});