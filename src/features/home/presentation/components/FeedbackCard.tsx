import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalization } from '@app/providers/LocalizationProvider';
import { AppCard, AppText, AppButton } from '@shared/components';
import { FeedbackModal } from '@features/feedback';

export const FeedbackCard: React.FC = () => {
  const { t } = useLocalization();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <AppCard style={styles.card} testID="feedback-card">
        <AppText variant="titleMedium" style={styles.title} testID="feedback-card-title">
          {t('features.feedbackTitle', { defaultValue: 'User Feedback' })}
        </AppText>
        <AppText variant="bodyMedium" color="#64748B" style={styles.description}>
          {t('features.feedbackDescription', {
            defaultValue: 'Report bugs or submit feature ideas with offline outbox queuing.',
          })}
        </AppText>
        <View style={styles.actionRow}>
          <AppButton
            testID="feedback-open-btn"
            title={t('features.sendFeedback', { defaultValue: 'Send Feedback' })}
            variant="outline"
            size="sm"
            onPress={() => setModalVisible(true)}
            style={styles.button}
          />
        </View>
      </AppCard>
      <FeedbackModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
  },
  button: {
    alignSelf: 'flex-start',
  },
});
