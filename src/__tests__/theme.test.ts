import { createAppTheme, lightColors, darkColors } from '../shared/theme';

describe('AppTheme', () => {
  it('should generate light theme correctly', () => {
    const theme = createAppTheme(false);
    expect(theme.isDark).toBe(false);
    expect(theme.colors.primary).toBe(lightColors.primary);
    expect(theme.colors.background).toBe(lightColors.background);
  });

  it('should generate dark theme correctly', () => {
    const theme = createAppTheme(true);
    expect(theme.isDark).toBe(true);
    expect(theme.colors.primary).toBe(darkColors.primary);
    expect(theme.colors.background).toBe(darkColors.background);
  });
});
