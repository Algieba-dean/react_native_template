import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled || loading ? 0.6 : 1,
    };

    const sizePadding = {
      sm: { paddingVertical: 6, paddingHorizontal: 12 },
      md: { paddingVertical: 10, paddingHorizontal: 16 },
      lg: { paddingVertical: 14, paddingHorizontal: 20 },
    }[size];

    let variantStyle: ViewStyle = {};
    switch (variant) {
      case 'primary':
        variantStyle = { backgroundColor: theme.colors.primary };
        break;
      case 'secondary':
        variantStyle = { backgroundColor: theme.colors.surfaceVariant };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.outline,
        };
        break;
      case 'ghost':
        variantStyle = { backgroundColor: 'transparent' };
        break;
    }

    return { ...base, ...sizePadding, ...variantStyle };
  };

  const getTextStyle = (): TextStyle => {
    let color = theme.colors.onPrimary;
    if (variant === 'secondary') {
      color = theme.colors.onSurfaceVariant;
    } else if (variant === 'outline' || variant === 'ghost') {
      color = theme.colors.primary;
    }

    const fontSize = {
      sm: 13,
      md: 15,
      lg: 16,
    }[size];

    return {
      color,
      fontSize,
      fontWeight: '600',
    };
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.onPrimary : theme.colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? styles.iconSpacing : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconSpacing: {
    marginLeft: 8,
  },
});
