import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalization } from '@app/providers/LocalizationProvider';
import { useTheme } from '@app/providers/ThemeProvider';
import { ScreenContainer, AppText, Divider } from '@shared/components';
import { EnvironmentCard } from './components/EnvironmentCard';
import { ThemeToggleCard } from './components/ThemeToggleCard';
import { LanguageSelectorCard } from './components/LanguageSelectorCard';

export const HomeScreen: React.FC = () => {
  const { t } = useLocalization();
  const { theme } = useTheme();

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <AppText variant="headlineMedium" style={styles.headline}>
          {t('appTitle')}
        </AppText>
        <AppText variant="bodyLarge" color={theme.colors.subtext} style={styles.summary}>
          {t('templateSummary')}
        </AppText>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <EnvironmentCard />
        <ThemeToggleCard />
        <LanguageSelectorCard />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 8,
  },
  headline: {
    marginBottom: 8,
  },
  summary: {
    lineHeight: 22,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    flex: 1,
  },
});
