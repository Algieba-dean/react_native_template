import { IStorageService, storageService } from '@shared/services/storage';
import { structuredLogger } from '@shared/utils/structuredLogger';
import { FeedbackClientConfig, FeedbackDraft, FeedbackReceipt, FeedbackSubmission } from './types';

const DRAFT_STORAGE_KEY = 'app_feedback_draft_v1';
const OUTBOX_STORAGE_KEY = 'app_feedback_outbox_v1';

export class FeedbackClient {
  private config: FeedbackClientConfig;
  private storage: IStorageService;

  constructor(config?: FeedbackClientConfig, storage: IStorageService = storageService) {
    this.config = config || { mockSubmission: true };
    this.storage = storage;
  }

  async loadDraft(): Promise<FeedbackDraft | null> {
    return this.storage.getItem<FeedbackDraft>(DRAFT_STORAGE_KEY);
  }

  async saveDraft(draft: Omit<FeedbackDraft, 'updatedAt'>): Promise<void> {
    const fullDraft: FeedbackDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    await this.storage.setItem(DRAFT_STORAGE_KEY, fullDraft);
  }

  async clearDraft(): Promise<void> {
    await this.storage.removeItem(DRAFT_STORAGE_KEY);
  }

  async submitFeedback(data: {
    category: FeedbackSubmission['category'];
    title: string;
    description: string;
    contact?: string;
    includeDiagnostics?: boolean;
    appVersion?: string;
    platform?: string;
  }): Promise<FeedbackReceipt> {
    if (!data.title.trim() || !data.description.trim()) {
      throw new Error('Feedback title and description are required.');
    }

    const submission: FeedbackSubmission = {
      category: data.category,
      title: data.title.trim(),
      description: data.description.trim(),
      contact: data.contact?.trim(),
      appVersion: data.appVersion || '1.0.0',
      platform: data.platform,
      diagnosticLogs: data.includeDiagnostics ? structuredLogger.snapshot() : undefined,
      submittedAt: new Date().toISOString(),
    };

    if (this.config.mockSubmission || !this.config.endpointUrl) {
      // Mock / Offline delivery simulation
      await this.clearDraft();
      return {
        id: `mock_${Date.now()}`,
        status: 'received',
        receiptNumber: `FB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        submittedAt: submission.submittedAt,
      };
    }

    try {
      const response = await fetch(this.config.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : {}),
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to submit feedback`);
      }

      const result = await response.json();
      await this.clearDraft();

      return {
        id: result.id || `fb_${Date.now()}`,
        status: 'received',
        receiptNumber: result.receiptNumber || `FB-${Date.now().toString(36).toUpperCase()}`,
        submittedAt: submission.submittedAt,
      };
    } catch (err) {
      // Enqueue to outbox for background retry and clear draft to avoid duplicate edits
      await this.enqueueToOutbox(submission);
      await this.clearDraft();
      return {
        id: `queued_${Date.now()}`,
        status: 'queued',
        receiptNumber: `PENDING-${Date.now().toString(36).toUpperCase()}`,
        submittedAt: submission.submittedAt,
      };
    }
  }

  private async enqueueToOutbox(submission: FeedbackSubmission): Promise<void> {
    const existing = (await this.storage.getItem<FeedbackSubmission[]>(OUTBOX_STORAGE_KEY)) || [];
    existing.push(submission);
    await this.storage.setItem(OUTBOX_STORAGE_KEY, existing);
  }

  async getOutbox(): Promise<FeedbackSubmission[]> {
    return (await this.storage.getItem<FeedbackSubmission[]>(OUTBOX_STORAGE_KEY)) || [];
  }

  async clearOutbox(): Promise<void> {
    await this.storage.removeItem(OUTBOX_STORAGE_KEY);
  }

  /**
   * Retries submission of queued outbox items when connectivity is restored.
   */
  async retryOutbox(): Promise<{ sent: number; remaining: number }> {
    const outbox = await this.getOutbox();
    if (outbox.length === 0) {
      return { sent: 0, remaining: 0 };
    }

    const remaining: FeedbackSubmission[] = [];
    let sent = 0;

    for (const item of outbox) {
      try {
        if (this.config.mockSubmission || !this.config.endpointUrl) {
          sent++;
          continue;
        }

        const response = await fetch(this.config.endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.authToken ? { Authorization: `Bearer ${this.config.authToken}` } : {}),
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          remaining.push(item);
        } else {
          sent++;
        }
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      await this.clearOutbox();
    } else {
      await this.storage.setItem(OUTBOX_STORAGE_KEY, remaining);
    }

    return { sent, remaining: remaining.length };
  }
}

export const feedbackClient = new FeedbackClient();
