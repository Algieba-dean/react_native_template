import { StructuredLogRecord } from '@shared/utils/structuredLogger';

export type FeedbackCategory = 'bug' | 'feature' | 'ui' | 'general';

export interface FeedbackDraft {
  category: FeedbackCategory;
  title: string;
  description: string;
  contact?: string;
  includeDiagnostics: boolean;
  updatedAt: string;
}

export interface FeedbackSubmission {
  category: FeedbackCategory;
  title: string;
  description: string;
  contact?: string;
  appVersion?: string;
  platform?: string;
  diagnosticLogs?: StructuredLogRecord[];
  submittedAt: string;
}

export interface FeedbackReceipt {
  id: string;
  status: 'received' | 'queued';
  receiptNumber: string;
  submittedAt: string;
}

export interface FeedbackClientConfig {
  endpointUrl?: string;
  authToken?: string;
  mockSubmission?: boolean;
}
