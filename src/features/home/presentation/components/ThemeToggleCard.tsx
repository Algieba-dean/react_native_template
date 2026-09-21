import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalization } from '@app/providers/LocalizationProvider';
import { useTheme } from '@app/providers/ThemeProvider';
import { AppCard, AppText, AppButton } from '@shared/components';
import { ThemeMode } from '@shared/theme';

export const ThemeToggleCard: React.FC = () => {
  const { t } = useLocalization();
  const { mode, setMode } = useTheme();

  const modes: { labelKey: string; value: ThemeMode }[] = [
    { labelKey: 'features.themeLight', value: 'light' },
    { labelKey: 'features.themeDark', value: 'dark' },
    { labelKey: 'features.themeSystem', value: 'system' },
  ];

  return (
    <AppCard style={styles.card} testID="theme-toggle-card">
      <AppText variant="titleMedium" style={styles.title} testID="theme-title">
        {t('features.theme')}
      </AppText>
      <View style={styles.buttonGroup}>
        {modes.map(item => (
          <AppButton
            key={item.value}
            testID={`theme-btn-${item.value}`}
            title={t(item.labelKey)}
            variant={mode === item.value ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setMode(item.value)}
            style={styles.button}
          />
        ))}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  title: {
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
