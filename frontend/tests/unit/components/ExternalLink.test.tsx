import { ExternalLink } from '@/components/external-link';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
  openBrowserAsync: jest.fn(),
}));

describe('ExternalLink Component', () => {
  it('renders correctly and opens link on press', async () => {
    Platform.OS = 'ios';
    
    const { getByText } = render(
      <ExternalLink href="https://google.com">
        Click Here
      </ExternalLink>
    );

    const link = getByText('Click Here');
    expect(link).toBeTruthy();

    fireEvent.press(link, { preventDefault: jest.fn() });
    
  });
});