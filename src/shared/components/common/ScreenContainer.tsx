import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@app/providers/ThemeProvider';

export type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right';

export interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeTop?: boolean;
  safeBottom?: boolean;
  edges?: SafeAreaEdge[];
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeTop = false,
  safeBottom = true,
  edges,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const activeEdges: Set<SafeAreaEdge> = edges
    ? new Set(edges)
    : new Set([
        ...(safeTop ? (['top'] as const) : []),
        ...(safeBottom ? (['bottom'] as const) : []),
        'left',
        'right',
      ]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: activeEdges.has('top') ? insets.top : 0,
    paddingBottom: activeEdges.has('bottom') ? insets.bottom : 0,
    paddingLeft: activeEdges.has('left') ? insets.left : 0,
    paddingRight: activeEdges.has('right') ? insets.right : 0,
  };

  return (
    <View style={[styles.root, containerStyle, style]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  staticContent: {
    flex: 1,
    padding: 24,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});
