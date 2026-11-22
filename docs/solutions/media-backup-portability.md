# Media Assets, File Storage & Portable Backup Strategy

This document outlines key technical considerations for storing and restoring media files (images, user attachments) in cross-platform React Native projects.

---

## 1. Operating System Storage Differences

### 1.1 iOS Sandbox Path Rotation
- On iOS, every application update or OS reinstall changes the application's UUID sandbox container path (e.g. `/var/mobile/Containers/Data/Application/<UUID>/Documents/`).
- **Critical Rule**: Never persist absolute iOS file paths into local database records. Always persist **relative paths** (e.g. `user_uploads/photo_123.jpg`), and resolve them dynamically at runtime with `RNFS.DocumentDirectoryPath + '/' + relativePath`.

### 1.2 Android Scoped Storage
- Modern Android (API level 29+) enforces Scoped Storage.
- Internal app files belong in `RNFS.DocumentDirectoryPath`.
- Files shared with other apps or external backup destinations require the system Document Provider / Storage Access Framework (`react-native-documents/picker` or `react-native-share`).

---

## 2. Portable Media Backup Strategies

When exporting application datasets containing user photos:

| Strategy | Advantages | Tradeoffs | Recommended For |
| :--- | :--- | :--- | :--- |
| **Base64 Embedded in JSON** | Single standalone file, zero external file dependency, works with any cloud storage | File size increases by ~33%, high memory consumption on large collections | Small archives (< 20 photos) |
| **ZIP Archive (Data + Media)** | High compression, preserves raw file formats, fast import/export | Requires native ZIP library (`react-native-zip-archive`) | Media-heavy applications |
| **Relative Path Manifest** | Lightweight, instant serialization | Media files remain on local device only | Device-local snapshot backups |

---

## 3. Atomic Replacement on Restore

Restoring backup archives must follow strict staging semantics:
1. Verify JSON schema, versioning, and CRC32 checksum.
2. Unpack media to a staging directory: `DocumentDirectoryPath/staging_restore/`.
3. If all media files extract successfully:
   - Atomically rename current media directory to `media_previous`.
   - Rename `staging_restore` to `media`.
   - Update database / AsyncStorage records.
4. If extraction fails midway:
   - Purge `staging_restore`.
   - Keep current state and active media completely untouched.
