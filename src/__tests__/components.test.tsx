import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ThemeProvider } from '../app/providers/ThemeProvider';
import { AppButton, AppText, Badge, Divider, AppCard, ScreenContainer } from '../shared/components';

const renderWithTheme = (ui: React.ReactElement, initialMode: 'light' | 'dark' = 'light') => {
  return render(<ThemeProvider initialMode={initialMode}>{ui}</ThemeProvider>);
};

describe('Shared UI Components', () => {
  describe('AppButton', () => {
    it('renders button title and responds to press events', () => {
      const onPressMock = jest.fn();
      const { getByText } = renderWithTheme(<AppButton title="Click Me" onPress={onPressMock} />);

      const buttonText = getByText('Click Me');
      expect(buttonText).toBeTruthy();
      fireEvent.press(buttonText);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not fire onPress when disabled or loading', () => {
      const onPressMock = jest.fn();
      const { getByText, rerender } = render(
        <ThemeProvider initialMode="light">
          <AppButton title="Disabled Btn" onPress={onPressMock} disabled />
        </ThemeProvider>,
      );

      fireEvent.press(getByText('Disabled Btn'));
      expect(onPressMock).not.toHaveBeenCalled();

      rerender(
        <ThemeProvider initialMode="light">
          <AppButton title="Loading Btn" onPress={onPressMock} loading />
        </ThemeProvider>,
      );
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('renders with custom variant and icon', () => {
      const { getByText, getByTestId } = renderWithTheme(
        <AppButton
          title="Ghost Action"
          variant="ghost"
          size="sm"
          onPress={jest.fn()}
          icon={<View testID="btn-icon" />}
        />,
      );

      expect(getByText('Ghost Action')).toBeTruthy();
      expect(getByTestId('btn-icon')).toBeTruthy();
    });
  });

  describe('AppText', () => {
    it('renders text with correct variant styling and alignment', () => {
      const { getByText } = renderWithTheme(
        <AppText variant="headlineMedium" align="center" color="#FF0000">
          Headline Sample
        </AppText>,
      );

      const textNode = getByText('Headline Sample');
      expect(textNode).toBeTruthy();
      expect(textNode.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            color: '#FF0000',
            textAlign: 'center',
          }),
        ]),
      );
    });
  });

  describe('Badge', () => {
    it('renders badge labels with different color variants', () => {
      const { getByText: getSuccess } = renderWithTheme(<Badge label="Active" variant="success" />);
      expect(getSuccess('Active')).toBeTruthy();

      const { getByText: getWarning } = renderWithTheme(
        <Badge label="Pending" variant="warning" />,
      );
      expect(getWarning('Pending')).toBeTruthy();

      const { getByText: getError } = renderWithTheme(<Badge label="Failed" variant="error" />);
      expect(getError('Failed')).toBeTruthy();

      const { getByText: getNeutral } = renderWithTheme(
        <Badge label="Archived" variant="neutral" />,
      );
      expect(getNeutral('Archived')).toBeTruthy();
    });
  });

  describe('Divider', () => {
    it('renders horizontal and vertical dividers', () => {
      const { UNSAFE_getAllByType } = renderWithTheme(
        <>
          <Divider orientation="horizontal" />
          <Divider orientation="vertical" />
        </>,
      );

      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('AppCard', () => {
    it('renders children inside card wrapper', () => {
      const { getByText } = renderWithTheme(
        <AppCard>
          <Text>Card Content Body</Text>
        </AppCard>,
      );

      expect(getByText('Card Content Body')).toBeTruthy();
    });
  });

  describe('ScreenContainer', () => {
    it('renders static screen container with safe area insets', () => {
      const { getByText } = renderWithTheme(
        <ScreenContainer safeTop={false} safeBottom={true}>
          <Text>Screen Body Content</Text>
        </ScreenContainer>,
      );

      expect(getByText('Screen Body Content')).toBeTruthy();
    });

    it('renders scrollable screen container when scrollable is true', () => {
      const { getByText } = renderWithTheme(
        <ScreenContainer scrollable edges={['top', 'bottom']}>
          <Text>Scrollable Body Content</Text>
        </ScreenContainer>,
      );

      expect(getByText('Scrollable Body Content')).toBeTruthy();
    });
  });
});
