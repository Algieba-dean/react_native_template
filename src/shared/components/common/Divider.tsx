import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

export interface DividerProps {
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({ style, orientation = 'horizontal' }) => {
  const { theme } = useTheme();

  if (orientation === 'vertical') {
    return <View style={[styles.vertical, { backgroundColor: theme.colors.border }, style]} />;
  }

  return <View style={[styles.horizontal, { backgroundColor: theme.colors.border }, style]} />;
};

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 12,
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
    marginHorizontal: 12,
  },
});
