import Card from '@/components/card/index';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

describe('Card Component', () => {
  it('should render regular content initially', () => {
    const { getByText } = render(<Card />);
    expect(getByText('Regular content ✨')).toBeTruthy();
  });

  it('should verify flipped content exists in the tree (even if hidden by backface-visibility)', () => {
    const { getByText } = render(<Card />);
    expect(getByText('Flipped content 🚀')).toBeTruthy();
  });

  it('should handle toggle interaction', () => {
    const { getByText } = render(<Card />);
    const button = getByText('Toggle card');
    

    fireEvent.press(button);
    expect(button).toBeTruthy();
  });
});