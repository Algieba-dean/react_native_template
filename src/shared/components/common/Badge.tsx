import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  style?: ViewStyle;
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style, testID }) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.isDark ? '#064E3B' : '#D1FAE5',
          text: theme.isDark ? '#6EE7B7' : '#065F46',
        };
      case 'warning':
        return {
          bg: theme.isDark ? '#78350F' : '#FEF3C7',
          text: theme.isDark ? '#FDE68A' : '#92400E',
        };
      case 'error':
        return {
          bg: theme.isDark ? '#7F1D1D' : '#FEE2E2',
          text: theme.isDark ? '#FCA5A5' : '#991B1B',
        };
      case 'neutral':
        return {
          bg: theme.colors.surfaceVariant,
          text: theme.colors.onSurfaceVariant,
        };
      case 'primary':
      default:
        return {
          bg: theme.colors.primaryContainer,
          text: theme.colors.onPrimaryContainer,
        };
    }
  };

  const { bg, text } = getVariantStyles();

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]} testID={testID}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
