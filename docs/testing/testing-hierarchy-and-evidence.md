# Testing Hierarchy & Traceable Verification Framework

Testing in enterprise mobile applications requires multiple distinct tiers of evidence. A green unit test run does not prove simulator UI correctness, and simulator execution does not prove physical device stability.

---

## 1. The Four-Tier Testing Pyramid

```
                ┌───────────────────────────────────┐
                │   Tier 4: Physical Device & QA    │ (Sensors, OS permissions, Backgrounding)
                ├───────────────────────────────────┤
                │   Tier 3: Declarative Maestro E2E │ (End-to-end user flows, Native Dialogs)
                ├───────────────────────────────────┤
                │   Tier 2: Component Integration   │ (RNTL, user interactions, Provider trees)
                ├───────────────────────────────────┤
                │   Tier 1: Pure Domain & Services  │ (Unit tests, Edge cases, Invariants)
                └───────────────────────────────────┘
```

### Tier 1: Pure Domain & Service Tests (Jest)
- Target: Domain calculations, validators, storage adapters, structured loggers, checksum contracts.
- Execution: Superfast (< 2s), zero UI dependencies.
- Command: `npm test`

### Tier 2: Component Integration Tests (RNTL)
- Target: Screen rendering, modal transitions, form inputs, button hitSlop and disabled states.
- Mocking boundary: Mock network clients and native bridges; do not mock domain logic.
- Command: `npm test -- src/__tests__/components.test.tsx`

### Tier 3: Declarative E2E Simulation (Maestro)
- Target: Full end-to-end user journeys (`.maestro/flows/`), cold launch, theme toggle, multi-language switching, file picker dialogs.
- Requirement: Deterministic synthetic data, reproducible states.
- Command: `make test-e2e`

### Tier 4: Physical Device & Manual QA
- Target: Real camera hardware, biometric sensors, memory pressure app kills, Android 15 16KB page size kernel behavior, screen reader (VoiceOver / TalkBack) navigation, dynamic font enlargement.
- Record: Device model, OS version, commit SHA, and reproducible trace logs.

---

## 2. Test Evidence Checklist Template

When verifying complex features before release, record evidence in the following format:

```markdown
### Verification Record
- **Commit SHA**: `<sha>`
- **Node / Toolchain**: Node `v20+`, JDK `17`, Xcode `16`
- **Automated Gates**:
  - `npm run check` (Lint, Format, Typecheck, Jest) -> Passed (X suites, Y tests)
  - `make test-e2e` -> All flows passed
- **Manual Physical Device Verification**:
  - Device: iPhone 15 Pro (iOS 18) / Pixel 8 (Android 15)
  - Interrupted write / force close during persistence -> Verified data safely restored from `.previous` / disk.
  - Large Accessibility text size (200% Dynamic Type) -> Verified dialog layouts do not truncate.
```
