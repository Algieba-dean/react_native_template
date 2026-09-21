export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  border: string;
  card: string;
  text: string;
  subtext: string;
  error: string;
  onError: string;
  success: string;
  warning: string;
}

export interface ThemeTypography {
  displayLarge: { fontSize: number; lineHeight: number; fontWeight: '700' };
  headlineMedium: { fontSize: number; lineHeight: number; fontWeight: '600' };
  titleMedium: { fontSize: number; lineHeight: number; fontWeight: '600' };
  bodyLarge: { fontSize: number; lineHeight: number; fontWeight: '400' };
  bodyMedium: { fontSize: number; lineHeight: number; fontWeight: '400' };
  labelMedium: { fontSize: number; lineHeight: number; fontWeight: '500' };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface AppTheme {
  isDark: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}
