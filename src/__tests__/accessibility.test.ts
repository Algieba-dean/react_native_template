import {
  MIN_TOUCH_TARGET,
  getAccessibleHitSlop,
  getButtonHitSlop,
  getContrastRatio,
} from '../shared/theme/accessibility';
import { lightColors, darkColors } from '../shared/theme/colors';

describe('Accessibility & Theme Guidelines', () => {
  it('enforces 44pt minimum touch target constant', () => {
    expect(MIN_TOUCH_TARGET).toBe(44);
  });

  it('calculates accessible hitSlop when element size is below 44pt', () => {
    const hitSlop = getAccessibleHitSlop(30, 24);
    expect(hitSlop.top).toBe(10); // (44 - 24) / 2 = 10
    expect(hitSlop.bottom).toBe(10);
    expect(hitSlop.left).toBe(7); // (44 - 30) / 2 = 7
    expect(hitSlop.right).toBe(7);
  });

  it('returns no hitSlop expansion when element already meets 44pt', () => {
    const hitSlop = getAccessibleHitSlop(50, 48);
    expect(hitSlop).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
  });

  it('provides accessible hitSlop for small buttons', () => {
    expect(getButtonHitSlop('sm')).toEqual({ top: 8, bottom: 8, left: 8, right: 8 });
    expect(getButtonHitSlop('md')).toBeUndefined();
    expect(getButtonHitSlop('lg')).toBeUndefined();
  });

  it('verifies contrast ratio calculation and WCAG AA threshold for primary text', () => {
    // Pure black on pure white has 21:1 contrast
    const blackWhiteContrast = getContrastRatio('#000000', '#FFFFFF');
    expect(blackWhiteContrast).toBeCloseTo(21, 0);

    // Light theme text on background must meet WCAG AA (>= 4.5:1 for body text)
    const lightTextContrast = getContrastRatio(lightColors.text, lightColors.background);
    expect(lightTextContrast).toBeGreaterThanOrEqual(4.5);

    // Dark theme text on background must meet WCAG AA (>= 4.5:1)
    const darkTextContrast = getContrastRatio(darkColors.text, darkColors.background);
    expect(darkTextContrast).toBeGreaterThanOrEqual(4.5);
  });
});
