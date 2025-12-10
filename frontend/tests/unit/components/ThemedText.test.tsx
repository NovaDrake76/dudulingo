import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(),
}));

describe('ThemedText Component', () => {
  beforeEach(() => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');
  });

  it('should render correctly with default props', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    
    const textElement = getByText('Hello World');
    expect(textElement).toBeTruthy();
  });

  it('should apply title styles when type is title', () => {
    const { getByText } = render(
      <ThemedText type="title">Title Text</ThemedText>
    );
    
    const textElement = getByText('Title Text');
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        { fontSize: 32, fontWeight: 'bold', lineHeight: 32 },
      ])
    );
  });

  it('should apply custom styles passed via props', () => {
    const { getByText } = render(
      <ThemedText style={{ marginTop: 10 }}>Custom Style</ThemedText>
    );
    
    const textElement = getByText('Custom Style');
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([{ marginTop: 10 }])
    );
  });
});