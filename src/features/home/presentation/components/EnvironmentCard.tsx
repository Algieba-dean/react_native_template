import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalization } from '@app/providers/LocalizationProvider';
import { useTheme } from '@app/providers/ThemeProvider';
import { useAppConfig } from '@app/providers/ConfigProvider';
import { AppEnvironmentUtils } from '@app/appConfig';
import { AppCard, AppText, Badge } from '@shared/components';

export const EnvironmentCard: React.FC = () => {
  const { t } = useLocalization();
  const { theme } = useTheme();
  const config = useAppConfig();

  const envLabel =
    t(`environment.${config.environment}` as any) ||
    AppEnvironmentUtils.getLabel(config.environment);

  return (
    <AppCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <AppText variant="titleMedium" style={styles.title} testID="environment-title">
            {t('runtimeEnvironmentTitle')}
          </AppText>
          <AppText
            variant="bodyMedium"
            color={theme.colors.subtext}
            style={styles.url}
            testID="environment-url">
            {config.apiBaseUrl}
          </AppText>
        </View>
        <Badge
          label={envLabel}
          variant={config.environment === 'production' ? 'success' : 'primary'}
          testID="environment-badge"
        />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    marginBottom: 4,
  },
  url: {
    fontSize: 13,
  },
});
