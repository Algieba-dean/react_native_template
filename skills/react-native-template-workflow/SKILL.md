---
name: react-native-template-workflow
description: Architecture rules, ADR guidelines, release checklist, and CI automation guide for React Native enterprise template
---

# React Native Template Workflow & Architecture Guide

This skill guide establishes enterprise governance standards, architectural boundaries, ADR documentation guidelines, release protocols, and CI/CD pipelines for projects built on this template.

---

## 1. Architectural Rules & Governance

### Core Principles
1. **Unidirectional Dependency Flow**:
   - `features` depends on `shared` and `app/providers`.
   - `domain` MUST NOT depend on `data` or `presentation`.
   - `shared` MUST NOT depend on any specific `features`.
   - `app` acts as the composition root, wiring providers, config, and navigation.

2. **State Management Protocol**:
   - **Server State**: Managed strictly through TanStack Query (`@tanstack/react-query`).
   - **Global UI State / Theme / Locale**: Context Providers (`ThemeProvider`, `LocalizationProvider`, `ConfigProvider`).
   - **Local Component State**: `useState` / `useReducer`.

3. **Error Handling & Resilience**:
   - Component rendering crashes are caught by `<ErrorBoundary>`.
   - Native unhandled JS exceptions are reported via `ErrorUtils`.
   - Asynchronous Hermes promise rejections are tracked via Hermes Promise Rejection Tracker.
   - Network failures are unified via Axios interceptor with standardized `AppError` normalization.

---

## 2. Architecture Decision Records (ADR) Guide

When making significant architectural changes (e.g., introducing a new state management library, changing navigation engines, migrating styling paradigms), record an ADR in `docs/adr/`.

### ADR File Format: `docs/adr/NNNN-<slug>.md`
```markdown
# ADR NNNN: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What problem are we solving? What are the requirements and constraints?]

## Decision
[What is the change we are committing to? What design or technology was chosen?]

## Consequences
- **Positive**: [Benefits achieved]
- **Negative / Risks**: [Trade-offs or additional complexities]
- **Neutral**: [Other side-effects]
```

---

## 3. Release Checklist & Versioning

Follow semantic versioning (`MAJOR.MINOR.PATCH`):
- `MAJOR`: Incompatible API changes, major dependency upgrades (e.g. React Native major version bump).
- `MINOR`: New features added in a backward-compatible manner.
- `PATCH`: Backward-compatible bug fixes.

### Pre-Release Verification Protocol
1. **Automated Quality Checks**:
   ```bash
   make check
   make test-coverage
   ```
2. **Native Sanity Verification**:
   - Execute iOS debug and release build via Xcode / Fastlane.
   - Execute Android debug and release APK / AAB build via Gradle / Fastlane.
3. **Environment Audit**:
   - Verify `.env.production` contains valid production URLs and flags.
4. **Changelog & Tagging**:
   - Draft release notes using `.github/workflows/release-drafter.yml`.
   - Tag commit: `git tag -a v1.0.0 -m "Release v1.0.0"`.

---

## 4. CI/CD Automation & GitHub Actions

### Workflow Map
- **`.github/workflows/ci.yml`**: Runs on every pull request and push to `main`/`master`. Executes linting, formatting check, type checking, unit tests with coverage, and matrix build validations.
- **`.github/workflows/labels.yml`**: Keeps issue and PR labels synchronized with `.github/labels.yml`.
- **`.github/workflows/semantic-pr.yml`**: Enforces Conventional Commits formatting on PR titles (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
- **`.github/workflows/security.yml`**: Performs automated dependency vulnerability scans and secret detection.
- **`.github/workflows/release-drafter.yml`**: Automatically aggregates merged pull requests into draft release notes categorized by label.

### Fastlane Mobile Deployment
Fastlane lanes located under `ios/fastlane` and `android/fastlane`:
```bash
# Build and upload iOS beta to TestFlight
bundle exec fastlane ios beta

# Build and upload Android beta to Google Play Internal Track
bundle exec fastlane android beta
```
