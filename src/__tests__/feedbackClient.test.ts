import { FeedbackClient } from '../features/feedback/feedbackClient';
import { InMemoryStorageAdapter } from '../shared/services/storage/storageService';
import { structuredLogger } from '../shared/utils/structuredLogger';

describe('FeedbackClient', () => {
  let storage: InMemoryStorageAdapter;
  let client: FeedbackClient;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
    structuredLogger.clear();
    client = new FeedbackClient({ mockSubmission: true }, storage);
  });

  it('manages draft lifecycle (save, load, clear)', async () => {
    expect(await client.loadDraft()).toBeNull();

    await client.saveDraft({
      category: 'bug',
      title: 'Crash on profile open',
      description: 'Steps to reproduce...',
      contact: 'tester@example.com',
      includeDiagnostics: true,
    });

    const draft = await client.loadDraft();
    expect(draft).not.toBeNull();
    expect(draft?.title).toBe('Crash on profile open');
    expect(draft?.category).toBe('bug');
    expect(draft?.updatedAt).toBeDefined();

    await client.clearDraft();
    expect(await client.loadDraft()).toBeNull();
  });

  it('validates mandatory fields on submit', async () => {
    await expect(
      client.submitFeedback({
        category: 'feature',
        title: '',
        description: 'valid desc',
      }),
    ).rejects.toThrow('Feedback title and description are required.');

    await expect(
      client.submitFeedback({
        category: 'feature',
        title: 'valid title',
        description: '  ',
      }),
    ).rejects.toThrow('Feedback title and description are required.');
  });

  it('submits feedback successfully and clears draft on completion', async () => {
    await client.saveDraft({
      category: 'ui',
      title: 'Padding issue',
      description: 'Card border overlaps',
      includeDiagnostics: true,
    });

    structuredLogger.info('storage.boundary', 'write_success', { status: 200 });

    const receipt = await client.submitFeedback({
      category: 'ui',
      title: 'Padding issue',
      description: 'Card border overlaps',
      includeDiagnostics: true,
    });

    expect(receipt.status).toBe('received');
    expect(receipt.receiptNumber).toMatch(/^FB-/);
    // Draft must be cleared after successful submission
    expect(await client.loadDraft()).toBeNull();
  });

  it('enqueues to outbox when remote network request fails', async () => {
    // Configure client with non-mock endpoint and mock fetch failure
    const networkClient = new FeedbackClient(
      {
        endpointUrl: 'https://api.example.com/feedback',
        mockSubmission: false,
      },
      storage,
    );

    // Mock global fetch rejection
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network offline'));

    const receipt = await networkClient.submitFeedback({
      category: 'bug',
      title: 'Offline test',
      description: 'Should queue to outbox',
    });

    expect(receipt.status).toBe('queued');
    expect(receipt.receiptNumber).toMatch(/^PENDING-/);

    const outbox = await networkClient.getOutbox();
    expect(outbox).toHaveLength(1);
    expect(outbox[0].title).toBe('Offline test');
    // Draft must also be cleared so user is not stuck with unsaved draft state
    expect(await networkClient.loadDraft()).toBeNull();

    // Now test retryOutbox when network is restored
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'fb_recovered', receiptNumber: 'FB-RECOVERED' }),
    });

    const retryResult = await networkClient.retryOutbox();
    expect(retryResult.sent).toBe(1);
    expect(retryResult.remaining).toBe(0);
    expect(await networkClient.getOutbox()).toHaveLength(0);

    global.fetch = originalFetch;
  });
});
