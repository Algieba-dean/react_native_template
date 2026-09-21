import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalization } from '@app/providers/LocalizationProvider';
import { AppCard, AppText, AppButton } from '@shared/components';
import { SupportedLanguage } from '@shared/localization/types';

export const LanguageSelectorCard: React.FC = () => {
  const { t, language, setLanguage } = useLocalization();

  const languages: { labelKey: string; code: SupportedLanguage }[] = [
    { labelKey: 'features.languageEn', code: 'en' },
    { labelKey: 'features.languageZh', code: 'zh-Hans' },
  ];

  return (
    <AppCard style={styles.card} testID="language-selector-card">
      <AppText variant="titleMedium" style={styles.title} testID="language-title">
        {t('features.language')}
      </AppText>
      <View style={styles.buttonGroup}>
        {languages.map(item => (
          <AppButton
            key={item.code}
            testID={`lang-btn-${item.code}`}
            title={t(item.labelKey)}
            variant={language === item.code ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setLanguage(item.code)}
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
