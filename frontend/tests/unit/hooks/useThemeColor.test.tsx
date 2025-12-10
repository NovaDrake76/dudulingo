import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('@/hooks/use-color-scheme');

jest.mock('@/constants/theme', () => ({
  Colors: {
    light: { background: '#ffffff', text: '#000000', tint: '#2f95dc' },
    dark: { background: '#000000', text: '#ffffff', tint: '#fff' },
  },
}), { virtual: true });

const TestComponent = ({ propsColor, colorName }: any) => {
  const color = useThemeColor(propsColor, colorName);
  return <Text>{color}</Text>;
};

describe('useThemeColor Integration', () => {
  it('returns correct color for light theme', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText } = render(<TestComponent propsColor={{}} colorName="background" />);
    expect(getByText('#ffffff')).toBeTruthy();
  });

  it('returns override color if provided', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { getByText } = render(<TestComponent propsColor={{ light: '#123456' }} colorName="background" />);
    expect(getByText('#123456')).toBeTruthy();
  });
});