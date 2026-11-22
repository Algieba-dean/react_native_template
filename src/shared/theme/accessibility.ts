import { Insets } from 'react-native';

/**
 * Standard minimum interactive touch target dimension (in density-independent points).
 * Aligns with Apple Human Interface Guidelines (44pt) and Material Design (48dp).
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Computes hitSlop Insets to ensure small components meet the 44pt touch boundary.
 */
export function getAccessibleHitSlop(width: number, height: number): Insets {
  const horizontalDiff = Math.max(0, (MIN_TOUCH_TARGET - width) / 2);
  const verticalDiff = Math.max(0, (MIN_TOUCH_TARGET - height) / 2);

  return {
    top: Math.ceil(verticalDiff),
    bottom: Math.ceil(verticalDiff),
    left: Math.ceil(horizontalDiff),
    right: Math.ceil(horizontalDiff),
  };
}

/**
 * Returns hitSlop insets based on standard button size tokens.
 */
export function getButtonHitSlop(size: 'sm' | 'md' | 'lg'): Insets | undefined {
  if (size === 'sm') {
    return { top: 8, bottom: 8, left: 8, right: 8 };
  }
  return undefined;
}

/**
 * Converts a hex color string to relative luminance according to WCAG 2.1 specifications.
 */
export function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Computes the WCAG contrast ratio between two hex colors (1:1 to 21:1).
 * WCAG AA requires:
 * - >= 4.5:1 for normal text
 * - >= 3.0:1 for large text (>18pt or bold >14pt) and UI components
 */
export function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  try {
    const l1 = getRelativeLuminance(foregroundHex);
    const l2 = getRelativeLuminance(backgroundHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 1;
  }
}
