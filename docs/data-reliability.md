# Data Persistence, Reliability, and Recovery Guidelines

This document details the architectural boundaries, persistence strategies, and disaster recovery contracts implemented in this template.

---

## 1. Storage Boundaries: Small Settings vs. Large Datasets

| Type | Intended Use | Storage Target | Mechanism | Failure Mode Handling |
| :--- | :--- | :--- | :--- | :--- |
| **Settings & Preferences** | Theme mode, language, flags, user IDs | Key-Value Storage (`AsyncStorageAdapter`) | JSON-serialized key-value records | Silent fallback to default, asynchronous flush |
| **Business Datasets & Files** | Offline documents, cache, collections | File System Storage (`DocumentDirectoryPath`) | Atomic file write + `.previous` rolling copy | Alert user, stage candidate, never overwrite with blank |
| **Sensitive Secrets** | Auth tokens, encryption keys | Secure Store (`Keychain` / `Keystore`) | OS Hardware Security Module | Re-authenticate, zero memory traces |

---

## 2. Core Persistence Safety Principles

### 2.1 Read-Before-Interactive Initialization
Applications must complete persistent data loading before allowing user operations. During bootstrap:
- Read existing stored data from disk/storage.
- If storage contains valid data, load it into state.
- If storage is empty (clean install), initialize with default starting data.
- **Never overwrite on read failure**: If reading throws an exception (e.g. disk I/O error, invalid JSON, or partial corruption), the store transitions to an `'error'` state. It **must not** blindly write default blank data over the potentially recoverable on-disk file.

### 2.2 Candidate Staging Pattern (Restore & Bulk Updates)
When restoring a backup or performing significant multi-entity updates:
1. Validate the candidate data completely against domain constraints and checksums.
2. Stage the candidate in memory (`stageCandidate`).
3. Commit to persistent disk storage first (`commitCandidate`).
4. Only after persistent write and flush succeeds, update active UI state.
5. If the write fails, rollback the candidate; in-memory active state remains unharmed.

### 2.3 Bounded Checksums & Envelope Specification
Backups use an explicit `BackupEnvelope<T>` containing:
- `schemaVersion`: Numeric versioning for schema evolution and migrations.
- `createdAt`: ISO 8601 timestamp.
- `checksum`: CRC32 or SHA-256 integrity hash of the serialized payload.
- `payload`: The actual structured domain entities.

Any backup payload with an unsupported schema version, missing header, or mismatched checksum is rejected before reaching application state.

---

## 3. Verification & Testing

Unit test coverage verifies:
- Fresh install initialization vs. existing state hydration.
- Preservation of disk contents on corrupt read failure (`onReadError`).
- Candidate staging, commit, and rollback flows.
- Checksum verification and version mismatch rejections.
