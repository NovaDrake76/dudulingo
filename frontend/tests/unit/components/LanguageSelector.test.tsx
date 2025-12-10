import LanguageSelector from '@/components/language-selector';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

describe('LanguageSelector Component', () => {
  const mockFlag = { uri: 'https://example.com/flag.png' };

  it('renders the language name correctly', () => {
    const onPressMock = jest.fn();

    const { getByText } = render(
      <LanguageSelector 
        languageName="Português" 
        flagSource={mockFlag} 
        onPress={onPressMock} 
      />
    );

    expect(getByText('Português')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();

    const { getByText } = render(
      <LanguageSelector 
        languageName="English" 
        flagSource={mockFlag} 
        onPress={onPressMock} 
      />
    );

    fireEvent.press(getByText('English'));
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});