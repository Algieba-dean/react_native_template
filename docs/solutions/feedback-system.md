# Mobile Feedback System Architecture & Solution Package

This document describes the optional feedback subsystem design, wire contracts, draft preservation, outbox retry mechanics, and privacy guarantees.

---

## 1. Overview & Business Workflow

```
[User Form / Modal]
       │
       ▼ (Draft Auto-Save to Storage)
[Draft State: app_feedback_draft_v1]
       │
       ▼ (Submit with Optional Redacted Diagnostics)
[Remote API Endpoint / Webhook]
       ├─► (Success) ──► Generate Receipt & Clear Draft
       └─► (Failure) ──► Enqueue to Outbox (app_feedback_outbox_v1) for Background Retry
```

---

## 2. Privacy & Data Minimization

When users choose "Attach Safe Diagnostics":
- **Only allowlisted structured log events** from `structuredLogger` are packaged.
- **Zero personal identifiable information (PII)**: User emails, authorization headers, passwords, session cookies, and arbitrary request query strings are excluded by design.
- The user is provided with clear UI transparency before submitting.

---

## 3. Wire Contracts

### 3.1 Submission Payload
```typescript
interface FeedbackSubmission {
  category: 'bug' | 'feature' | 'ui' | 'general';
  title: string;
  description: string;
  contact?: string;
  appVersion?: string;
  platform?: 'ios' | 'android';
  diagnosticLogs?: StructuredLogRecord[];
  submittedAt: string;
}
```

### 3.2 Receipt Response
```typescript
interface FeedbackReceipt {
  id: string;
  status: 'received' | 'queued';
  receiptNumber: string;
  submittedAt: string;
}
```

---

## 4. Backend Adapter Options

The feedback client is agnostic to the destination backend. Recommended production targets:
1. **Serverless Cloudflare Worker / AWS Lambda**: Validates payload, rate-limits submissions, stores in D1 / DynamoDB, and forwards notifications via Webhook (Discord / Slack / Telegram).
2. **Jira Service Management**: Directly creates customer service tickets via Jira REST API (see `docs/solutions/jira-integration.md`).
3. **GitHub Issues**: Submits sanitized user issues via authenticated GitHub REST API.
