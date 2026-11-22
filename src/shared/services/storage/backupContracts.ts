/* eslint-disable no-bitwise */
/**
 * Portable Backup & Restore Contract Specification
 *
 * Designed to provide tamper-evident, version-checked data portability
 * across devices, installs, and storage backends.
 */

export interface BackupHeader {
  schemaVersion: number;
  appVersion?: string;
  createdAt: string;
  checksum: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface BackupEnvelope<T = unknown> {
  header: BackupHeader;
  payload: T;
}

/**
 * Computes CRC32 checksum as a deterministic hexadecimal string.
 * Used for verifying payload integrity without heavy native crypto dependencies.
 */
export function computeCrc32(data: string): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff];
  }
  const result = (crc ^ -1) >>> 0;
  return `crc32_${result.toString(16).padStart(8, '0')}`;
}

const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

export interface BackupValidationResult<T> {
  valid: boolean;
  error?: string;
  envelope?: BackupEnvelope<T>;
}

/**
 * Validates a raw backup JSON string:
 * 1. Verifies JSON syntax.
 * 2. Validates envelope header and supported schema versions.
 * 3. Verifies checksum integrity against actual payload serialized data.
 */
export function validateBackupEnvelope<T>(
  rawJson: string,
  options: {
    supportedVersions: number[];
    validatePayload?: (payload: unknown) => payload is T;
  },
): BackupValidationResult<T> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    return { valid: false, error: 'Invalid JSON format in backup content' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, error: 'Backup root must be an object' };
  }

  const envelope = parsed as Partial<BackupEnvelope<T>>;
  if (!envelope.header || typeof envelope.header !== 'object') {
    return { valid: false, error: 'Missing or malformed backup header' };
  }

  const { schemaVersion, checksum } = envelope.header;
  if (typeof schemaVersion !== 'number' || !options.supportedVersions.includes(schemaVersion)) {
    return {
      valid: false,
      error: `Unsupported backup schema version: ${schemaVersion}. Supported versions: ${options.supportedVersions.join(', ')}`,
    };
  }

  if (envelope.payload === undefined) {
    return { valid: false, error: 'Missing backup payload' };
  }

  // Verify Checksum
  const computed = computeCrc32(JSON.stringify(envelope.payload));
  if (checksum !== computed) {
    return {
      valid: false,
      error: `Backup checksum verification failed (expected: ${checksum}, computed: ${computed})`,
    };
  }

  if (options.validatePayload && !options.validatePayload(envelope.payload)) {
    return { valid: false, error: 'Backup payload failed domain schema validation' };
  }

  return {
    valid: true,
    envelope: envelope as BackupEnvelope<T>,
  };
}

/**
 * Creates a signed and versioned BackupEnvelope.
 */
export function createBackupEnvelope<T>(
  payload: T,
  schemaVersion: number,
  options?: { appVersion?: string; metadata?: Record<string, string | number | boolean> },
): BackupEnvelope<T> {
  const payloadStr = JSON.stringify(payload);
  const checksum = computeCrc32(payloadStr);

  return {
    header: {
      schemaVersion,
      appVersion: options?.appVersion,
      createdAt: new Date().toISOString(),
      checksum,
      ...(options?.metadata ? { metadata: options.metadata } : {}),
    },
    payload,
  };
}
