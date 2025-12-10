import { Collapsible } from '@/components/ui/collapsible';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('@/components/ui/icon-symbol', () => {
  const { Text } = require('react-native');
  return {
    IconSymbol: () => <Text>Icon</Text>,
  };
});

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000',
}));

describe('Collapsible Component', () => {
  it('toggles content visibility when pressed', () => {
    const { getByText } = render(
      <Collapsible title="Toggle Me">
        <Text>Secret Content</Text>
      </Collapsible>
    );

    expect(getByText('Toggle Me')).toBeTruthy();
    
    fireEvent.press(getByText('Toggle Me'));
    
    expect(getByText('Secret Content')).toBeTruthy();
  });
});