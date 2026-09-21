# ADR 0001: React Native Template Baseline & Architecture Decisions

## Status
Accepted

## Date
2026-09-21

## Context
When bootstrapping enterprise-grade React Native mobile applications, teams frequently struggle with inconsistent directory layouts, ad-hoc state management, mixed styling paradigms, missing multi-environment configurations, and absence of standardized CI/CD pipelines.

We need a foundational template that enforces engineering discipline, modularity, type safety, testability, and smooth continuous delivery while maintaining developer ergonomics.

## Decision

We have established the following baseline architectural and technical decisions:

1. **Architecture & Project Layout**:
   - Adopt **Feature-First + Clean Architecture** modular breakdown (`src/app`, `src/features`, `src/shared`).
   - Strict unidirectional dependencies: `features` consume `shared`, but `shared` never imports from `features`. `app` handles bootstrap and global context injection.

2. **TypeScript & Strict Typing**:
   - TypeScript in strict mode enabled across all source modules and tests.
   - Absolute module path aliases configured (`@/*` -> `src/*`).

3. **Multi-Environment Runtime Configuration**:
   - Multi-stage environment files (`.env.development`, `.env.staging`, `.env.production`).
   - Strongly typed `AppConfig` runtime singleton with environment detection and fail-safe defaults.

4. **Design System & Theming**:
   - Design-token-driven theming architecture (`Light` and `Dark` modes).
   - Unified typography scale, color palette tokens, elevation, and spacing matrix.
   - Dedicated `ThemeProvider` with dynamic switching and persistence.

5. **Localization (i18n)**:
   - Built-in internationalization supporting English (`en`) and Simplified Chinese (`zh-Hans`).
   - Nested namespace keys with fallback resolution.

6. **Networking & Data Management**:
   - Typed Axios HTTP client with request/response interceptors, auth token injection hooks, and standardized error transformation (`ApiError`).
   - React Query (`@tanstack/react-query`) provider initialized for server state caching.

7. **Storage Abstraction**:
   - `StorageService` interface with in-memory fallback and ready hook for persistent adapters (`AsyncStorage` / `MMKV`).

8. **Reliability & Crash Resilience**:
   - Zone-guarded bootstrap lifecycle (`bootstrap()`).
   - Top-level `ErrorBoundary` with recovery retry trigger.

9. **CI/CD & DevOps Automation**:
   - GitHub Actions CI matrix covering Linting (ESLint), Formatting (Prettier), Type Checking (`tsc`), and Jest test coverage.
   - Security auditing, Conventional Commits validation, PR auto-labeling, CodeQL analysis, and Release Drafter.

## Consequences

### Positive
- Consistent code structure across multiple enterprise mobile projects.
- Clear separation of concerns speeds up developer onboarding.
- High test coverage and automated CI checks prevent regressions before merging.
- Out-of-the-box support for multi-environment deployments and localization.

### Negative / Trade-offs
- Slight initial learning curve for developers unfamiliar with Feature-First architecture.
- Maintaining strict typing requires discipline when defining external API contracts.
