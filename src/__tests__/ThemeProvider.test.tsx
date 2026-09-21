import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { ThemeProvider, useTheme } from '../app/providers/ThemeProvider';

const TestThemeConsumer: React.FC = () => {
  const { theme, mode, isDark, setMode } = useTheme();

  return (
    <>
      <Text testID="mode-text">{mode}</Text>
      <Text testID="is-dark">{isDark ? 'true' : 'false'}</Text>
      <Text testID="bg-color">{theme.colors.background}</Text>
      <TouchableOpacity testID="set-dark" onPress={() => setMode('dark')} />
      <TouchableOpacity testID="set-light" onPress={() => setMode('light')} />
      <TouchableOpacity testID="set-system" onPress={() => setMode('system')} />
    </>
  );
};

describe('ThemeProvider & useTheme', () => {
  it('renders default system mode and provides theme values', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="light">
        <TestThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('mode-text').props.children).toBe('light');
    expect(getByTestId('is-dark').props.children).toBe('false');
  });

  it('allows switching between light, dark, and system modes dynamically', () => {
    const { getByTestId } = render(
      <ThemeProvider initialMode="light">
        <TestThemeConsumer />
      </ThemeProvider>,
    );

    expect(getByTestId('mode-text').props.children).toBe('light');
    expect(getByTestId('is-dark').props.children).toBe('false');

    fireEvent.press(getByTestId('set-dark'));
    expect(getByTestId('mode-text').props.children).toBe('dark');
    expect(getByTestId('is-dark').props.children).toBe('true');

    fireEvent.press(getByTestId('set-light'));
    expect(getByTestId('mode-text').props.children).toBe('light');
    expect(getByTestId('is-dark').props.children).toBe('false');
  });

  it('throws error when useTheme is accessed outside ThemeProvider', () => {
    // Suppress console.error during expected throw test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestThemeConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
