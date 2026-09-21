import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

export interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const AppCard: React.FC<AppCardProps> = ({ children, style, testID }) => {
  const { theme } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.borderRadius.md,
          borderColor: theme.colors.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
  },
});
