import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../app/ErrorBoundary';

const Bomb: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test Crash Boom!');
  }
  return <Text testID="safe-content">All good</Text>;
};

describe('ErrorBoundary Component', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('renders children correctly when no errors occur', () => {
    const { getByTestId } = render(
      <SafeAreaProvider>
        <ErrorBoundary>
          <Text testID="safe-content">All good</Text>
        </ErrorBoundary>
      </SafeAreaProvider>,
    );

    expect(getByTestId('safe-content')).toBeTruthy();
  });

  it('catches component error and displays default error UI', () => {
    const { getByText, queryByTestId } = render(
      <SafeAreaProvider>
        <ErrorBoundary>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      </SafeAreaProvider>,
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText(/Test Crash Boom!/)).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
    expect(queryByTestId('safe-content')).toBeNull();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = (error: Error, reset: () => void) => (
      <View>
        <Text testID="custom-fallback">Custom: {error.message}</Text>
        <TouchableOpacity testID="custom-reset" onPress={reset} />
      </View>
    );

    const { getByTestId } = render(
      <SafeAreaProvider>
        <ErrorBoundary fallback={customFallback}>
          <Bomb shouldThrow={true} />
        </ErrorBoundary>
      </SafeAreaProvider>,
    );

    expect(getByTestId('custom-fallback').props.children).toEqual(['Custom: ', 'Test Crash Boom!']);
  });

  it('allows resetting error state with Try Again button', () => {
    let shouldCrash = true;
    const DynamicBomb: React.FC = () => {
      if (shouldCrash) {
        throw new Error('Temporary Failure');
      }
      return <Text testID="recovered-content">Recovered Successfully</Text>;
    };

    const { getByText, getByTestId, queryByText } = render(
      <SafeAreaProvider>
        <ErrorBoundary>
          <DynamicBomb />
        </ErrorBoundary>
      </SafeAreaProvider>,
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Fix the condition causing failure and trigger reset
    shouldCrash = false;
    fireEvent.press(getByText('Try Again'));

    expect(queryByText('Something went wrong')).toBeNull();
    expect(getByTestId('recovered-content')).toBeTruthy();
  });
});
