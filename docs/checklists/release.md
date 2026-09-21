# Release Checklist

Use this checklist before preparing and publishing a new release build (Staging / Production) for iOS and Android.

---

## 1. Pre-Release Verification

- [ ] All target milestone PRs are merged into `main`.
- [ ] CI pipeline (`ci.yml`) passes cleanly on `main` branch.
- [ ] No high/critical vulnerability alerts from `npm audit` or CodeQL.
- [ ] Unit & integration test coverage meets project threshold (>= 80%).
- [ ] Localization strings verified in all supported languages (`en`, `zh-Hans`).
- [ ] Release notes / Changelog generated via Release Drafter and reviewed.

---

## 2. Versioning & Configuration

- [ ] Version numbers updated in `package.json` and `app.json` according to SemVer (`MAJOR.MINOR.PATCH`).
- [ ] iOS `CFBundleShortVersionString` and `CFBundleVersion` (Build number) bumped.
- [ ] Android `versionName` and `versionCode` bumped.
- [ ] Environment variables verified for target release profile (`.env.production` / `.env.staging`):
  - [ ] API Base URL points to production/staging endpoints.
  - [ ] Sentry / Crashlytics DSN and analytics keys properly configured.
  - [ ] Feature flags set correctly for release.

---

## 3. Build & Smoke Testing

- [ ] Clean build artifacts:
  ```bash
  npm run clean # or rm -rf node_modules, ios/build, android/app/build
  npm install
  ```
- [ ] iOS Release Build:
  - [ ] Archived without signing errors in Xcode.
  - [ ] Tested on physical iOS test device via TestFlight.
- [ ] Android Release Build:
  - [ ] Release AAB generated and signed with production keystore.
  - [ ] Tested on physical Android device via Google Play Internal Testing.
- [ ] Smoke Test Checklist:
  - [ ] App launches smoothly without crash on cold start.
  - [ ] Authentication / Session persistence works across restarts.
  - [ ] API requests succeed with valid SSL certificates.
  - [ ] Theme switching (Dark/Light) works without UI glitches.
  - [ ] Language switching works dynamically.
  - [ ] Error Boundary recovers appropriately on unexpected exceptions.

---

## 4. Post-Release & Tagging

- [ ] Git release tag pushed (e.g., `git tag v1.0.0 && git push origin v1.0.0`).
- [ ] GitHub Release published with finalized release notes and binaries attached (if applicable).
- [ ] Staging/Production monitoring dashboards (Sentry, Datadog) checked for anomaly spikes.
