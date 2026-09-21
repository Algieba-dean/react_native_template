# Fastlane Automation Guide

This guide details how to set up, configure, and execute automated mobile builds and deployments using [Fastlane](https://fastlane.tools/) for both iOS and Android.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- Ruby (>= 3.0) and Bundler: `gem install bundler`
- Xcode command-line tools (for iOS)
- Android SDK and JDK 17 (for Android)

Install ruby dependencies:
```bash
bundle install
```

---

## 2. iOS Configuration (`ios/fastlane`)

### Fastfile Setup
Create `ios/fastlane/Fastfile` with standard lanes:
- `beta`: Increment build number, match/code sign certificates, build `.ipa` using `gym`, upload to Apple TestFlight with `pilot`.
- `release`: Build production `.ipa` and submit to App Store Connect.

### Match (Code Signing)
We recommend using `fastlane match` with Git storage or Google Cloud Storage to manage signing certificates and provisioning profiles across the engineering team.

```bash
# Sync certificates
bundle exec fastlane match appstore
bundle exec fastlane match development
```

### Running iOS Lanes
```bash
# Deploy to TestFlight
bundle exec fastlane ios beta

# Deploy release build
bundle exec fastlane ios release
```

---

## 3. Android Configuration (`android/fastlane`)

### Fastfile Setup
Create `android/fastlane/Fastfile` with standard lanes:
- `beta`: Build Android App Bundle (`.aab`) with `gradle(task: 'bundleRelease')`, upload to Google Play Console Internal Track using `supply`.
- `promote_to_production`: Promote existing internal track release to production track.

### Keystore and Service Account
1. Place `service-account.json` in a secure location (or inject via CI secrets).
2. Configure keystore properties in `android/keystore.properties` (ignored in `.gitignore`).

### Running Android Lanes
```bash
# Build & upload to Google Play Internal Test track
bundle exec fastlane android beta

# Promote build to production
bundle exec fastlane android promote_to_production
```

---

## 4. Continuous Integration (CI) Integration

Fastlane lanes can be executed automatically in GitHub Actions by injecting:
- `APP_STORE_CONNECT_API_KEY_KEY_ID`
- `APP_STORE_CONNECT_API_KEY_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_KEY`
- `MATCH_PASSWORD`
- `MATCH_GIT_PRIVATE_KEY`
- `PLAY_STORE_JSON_KEY`
- `ANDROID_KEYSTORE_BASE64`
