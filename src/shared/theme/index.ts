import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { AppTheme } from './types';

export * from './types';
export * from './colors';
export * from './typography';
export * from './spacing';

export const createAppTheme = (isDark: boolean): AppTheme => ({
  isDark,
  colors: isDark ? darkColors : lightColors,
  typography,
  spacing,
  borderRadius,
});
