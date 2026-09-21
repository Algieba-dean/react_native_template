import React, { ReactNode } from 'react';
import { Text as RNText, TextStyle, TextProps } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { ThemeTypography } from '@shared/theme';

export type TypographyVariant = keyof ThemeTypography;

export interface AppTextProps extends TextProps {
  children: ReactNode;
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle;
  align?: 'left' | 'center' | 'right';
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'bodyMedium',
  color,
  style,
  align = 'left',
  ...rest
}) => {
  const { theme } = useTheme();

  const variantStyle = theme.typography[variant];
  const textColor = color ?? theme.colors.text;

  return (
    <RNText
      style={[
        {
          color: textColor,
          textAlign: align,
          ...variantStyle,
        },
        style,
      ]}
      {...rest}>
      {children}
    </RNText>
  );
};
