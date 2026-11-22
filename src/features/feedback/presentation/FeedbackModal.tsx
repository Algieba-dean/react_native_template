/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  ScrollView,
} from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { feedbackClient } from '../feedbackClient';
import { FeedbackCategory, FeedbackReceipt } from '../types';

export interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();

  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<FeedbackReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load draft on open
  useEffect(() => {
    if (visible) {
      setReceipt(null);
      setErrorMessage(null);
      feedbackClient.loadDraft().then(draft => {
        if (draft) {
          setCategory(draft.category);
          setTitle(draft.title);
          setDescription(draft.description);
          setContact(draft.contact || '');
          setIncludeDiagnostics(draft.includeDiagnostics);
        }
      });
    }
  }, [visible]);

  // Auto-save draft on edit
  const handleContentChange = (
    newTitle: string,
    newDesc: string,
    newContact: string,
    newCategory: FeedbackCategory,
    newDiagnostics: boolean,
  ) => {
    setTitle(newTitle);
    setDescription(newDesc);
    setContact(newContact);
    setCategory(newCategory);
    setIncludeDiagnostics(newDiagnostics);

    if (newTitle.trim() || newDesc.trim()) {
      feedbackClient.saveDraft({
        title: newTitle,
        description: newDesc,
        contact: newContact,
        category: newCategory,
        includeDiagnostics: newDiagnostics,
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both a title and description.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await feedbackClient.submitFeedback({
        category,
        title,
        description,
        contact,
        includeDiagnostics,
      });
      setReceipt(res);
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { label: string; value: FeedbackCategory }[] = [
    { label: 'Bug Report', value: 'bug' },
    { label: 'Feature Request', value: 'feature' },
    { label: 'UI / UX', value: 'ui' },
    { label: 'General', value: 'general' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Send Feedback</Text>

            {receipt ? (
              <View style={styles.successBox}>
                <Text style={[styles.successTitle, { color: theme.colors.success }]}>
                  Thank you!
                </Text>
                <Text style={[styles.receiptText, { color: theme.colors.subtext }]}>
                  Receipt: {receipt.receiptNumber} ({receipt.status})
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close feedback">
                  <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {errorMessage && (
                  <View style={[styles.errorBox, { backgroundColor: theme.colors.error + '20' }]}>
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errorMessage}
                    </Text>
                  </View>
                )}

                {/* Category Selector */}
                <View style={styles.categoryRow}>
                  {categories.map(cat => {
                    const isSelected = category === cat.value;
                    return (
                      <TouchableOpacity
                        key={cat.value}
                        style={[
                          styles.catPill,
                          {
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                            backgroundColor: isSelected
                              ? theme.colors.primaryContainer
                              : 'transparent',
                          },
                        ]}
                        onPress={() =>
                          handleContentChange(
                            title,
                            description,
                            contact,
                            cat.value,
                            includeDiagnostics,
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={cat.label}>
                        <Text
                          style={[
                            styles.catText,
                            {
                              color: isSelected ? theme.colors.primary : theme.colors.text,
                            },
                          ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Title Input */}
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="Summary / Title"
                  placeholderTextColor={theme.colors.subtext}
                  value={title}
                  onChangeText={val =>
                    handleContentChange(val, description, contact, category, includeDiagnostics)
                  }
                  accessibilityLabel="Feedback title"
                />

                {/* Description Input */}
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="Describe your issue or suggestion..."
                  placeholderTextColor={theme.colors.subtext}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={val =>
                    handleContentChange(title, val, contact, category, includeDiagnostics)
                  }
                  accessibilityLabel="Feedback description"
                />

                {/* Contact Input */}
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="Contact email (optional)"
                  placeholderTextColor={theme.colors.subtext}
                  value={contact}
                  onChangeText={val =>
                    handleContentChange(title, description, val, category, includeDiagnostics)
                  }
                  accessibilityLabel="Contact email"
                />

                {/* Privacy & Diagnostics Switch */}
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <Text style={[styles.switchTitle, { color: theme.colors.text }]}>
                      Attach Safe Diagnostics
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: theme.colors.subtext }]}>
                      Includes non-sensitive system logs (no personal data or URLs).
                    </Text>
                  </View>
                  <Switch
                    value={includeDiagnostics}
                    onValueChange={val =>
                      handleContentChange(title, description, contact, category, val)
                    }
                    accessibilityLabel="Toggle diagnostics logs"
                  />
                </View>

                {/* Actions */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel feedback">
                    <Text style={[styles.cancelText, { color: theme.colors.subtext }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: theme.colors.primary,
                        opacity: submitting ? 0.7 : 1,
                      },
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    accessibilityRole="button"
                    accessibilityLabel="Submit feedback">
                    {submitting ? (
                      <ActivityIndicator color={theme.colors.onPrimary} size="small" />
                    ) : (
                      <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
                        Submit
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    borderRadius: 16,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  catText: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  receiptText: {
    fontSize: 15,
    marginBottom: 20,
  },
});
