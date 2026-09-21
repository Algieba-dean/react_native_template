# Maestro E2E Simulation Testing Guide

This guide details how end-to-end (E2E) simulation testing is structured, authored, executed, and automated in the React Native template using [Maestro](https://maestro.mobile.dev/).

---

## 📖 Overview

Maestro is a declarative, painless mobile UI testing framework built for React Native, iOS, and Android applications. Unlike traditional Appium or Detox setups that often suffer from fragile driver bindings, complex synchronization issues, or brittle selectors, Maestro interacts with apps from the outside through declarative YAML flows.

### Key Benefits
- **Zero JS Bridge Coupling**: Tests run at the OS accessibility level, mirroring real end-user interaction.
- **Declarative YAML Syntax**: Human-readable, easy to maintain, and fast to review in PRs.
- **Built-in Resilience**: Automatically handles frame rendering, animations, screen transitions, and network latencies without arbitrary `sleep` timeouts.
- **Native OS Dialog Handling**: Seamlessly handles system permission dialogs, alert popups, device rotation, and hardware navigation.
- **Interactive Visual Studio**: Inspect UI hierarchies and draft flows interactively with Maestro Studio.

---

## 📦 Installation & Setup

### 1. Install Maestro CLI
Install the Maestro command-line tool on your development machine (macOS / Linux):

```bash
curl -FsSL "https://get.maestro.mobile.dev" | bash
```

Ensure `~/.maestro/bin` is in your `$PATH` (typically added automatically). Verify the installation:

```bash
maestro --version
```

### 2. Prepare Emulators / Simulators

- **iOS Simulator**: Open any iOS simulator via Xcode (`open -a Simulator`).
- **Android Emulator**: Launch an Android Virtual Device (AVD) with Google APIs enabled.

---

## 📁 Directory Structure

All E2E test assets are located under the `.maestro/` directory:

```
.maestro/
├── config.yaml                       # Global test suite configuration & environment variables
└── flows/                            # Declarative test flows
    ├── 01_app_launch.yaml            # Cold start, header & environment card verification
    ├── 02_theme_toggle.yaml          # Theme mode switching (Light / Dark / System)
    ├── 03_language_switch.yaml       # Internationalization & localized copy verification
    └── 04_system_dialogs_and_files.yaml # System permissions, alerts & file/media simulation
```

---

## 🧪 Flow Suite Overview

### 1. Suite Configuration (`.maestro/config.yaml`)
Defines the target bundle ID (`com.enterprise.reactnativetemplate`), suite tags, and environment variables:

```yaml
appId: com.enterprise.reactnativetemplate
name: Enterprise React Native Template E2E Suite
tags:
  - e2e
  - smoke
  - regression
env:
  APP_ID: com.enterprise.reactnativetemplate
  DEFAULT_TIMEOUT_MS: 15000
```

### 2. App Cold Start (`01_app_launch.yaml`)
Validates that the app boots cleanly from cold start, clears any previous state, and renders expected titles and environment indicators.

```yaml
appId: com.enterprise.reactnativetemplate
---
- launchApp:
    clearState: true
- assertVisible: "Enterprise React Native Template"
- assertVisible: "Runtime Environment"
- assertVisible: "Development"
```

### 3. Theme Toggle (`02_theme_toggle.yaml`)
Validates interactive theme selection across Dark, Light, and System modes.

```yaml
appId: com.enterprise.reactnativetemplate
---
- launchApp
- assertVisible: "Theme Mode"
- tapOn: "Dark"
- tapOn: "Light"
- tapOn: "System"
```

### 4. Language Switch (`03_language_switch.yaml`)
Verifies dynamic locale switching between English and Simplified Chinese (`zh-Hans`), ensuring localized copy matches the i18n dictionary.

```yaml
appId: com.enterprise.reactnativetemplate
---
- launchApp
- tapOn: "简体中文"
- assertVisible: "企业级 React Native 模版"
- assertVisible: "运行时环境配置"
- tapOn: "English"
- assertVisible: "Enterprise React Native Template"
```

### 5. System Dialogs & File Pickers (`04_system_dialogs_and_files.yaml`)
Demonstrates how to handle OS system popups, permission requests, device lifecycle events, and file picking.

#### Handling System Permission Dialogs
```yaml
# Handle Notification or Generic Dialogs
- runFlow:
    when:
      visible: "(?i).*Allow.*|.*OK.*|.*Confirm.*"
    commands:
      - tapOn:
          text: "(?i).*Allow.*|.*OK.*|.*Confirm.*"
          optional: true

# Handle Location / Media Permission Prompts
- runFlow:
    when:
      visible: "(?i).*While using the app.*"
    commands:
      - tapOn:
          text: "(?i).*While using the app.*"
          optional: true
```

#### Simulating File & Media Storage
Maestro provides the `addMedia` command to seed files or images into the emulator/simulator gallery before interacting with document or image pickers:

```yaml
# Push mock media assets into simulator storage
- addMedia:
    - "assets/sample_document.pdf"
    - "assets/sample_avatar.jpg"
```

---

## 💻 Running Tests Locally

### Quick Commands

```bash
# Run all E2E flows
npm run test:e2e
# or
make test-e2e

# Launch interactive Maestro Studio (visual hierarchy inspector & flow recorder)
npm run test:e2e:studio
# or
make e2e-studio
```

### Running Specific Flows

```bash
# Run a single flow
maestro test .maestro/flows/01_app_launch.yaml

# Run continuously on file changes (hot reloading for tests)
maestro test --continuous .maestro/flows/01_app_launch.yaml

# Output JUnit XML report
maestro test --format junit --output test-report.xml .maestro/flows/
```

---

## 🎨 Maestro Studio (Interactive Inspector)

Maestro Studio opens an interactive browser UI connected to your running simulator. It allows you to:
1. View the exact accessibility tree and visible text selectors.
2. Click any UI element to see suggested Maestro commands (`tapOn`, `assertVisible`, `id`).
3. Interactively test assertions and generate replayable flow files.

```bash
make e2e-studio
```

---

## 🤖 Continuous Integration (GitHub Actions)

The workflow `.github/workflows/maestro.yml` automates Maestro E2E test execution on pull requests and main branch merges.

### Highlights of CI Pipeline:
- **Matrix & Runner**: Executes on `macos-14` runner with hardware acceleration.
- **Android Virtual Device (AVD)**: Uses `reactivecircus/android-emulator-runner` with API 34.
- **Artifacts**: Generates JUnit XML test reports and stores failure logs / screenshots for 7 days.
- **Cloud Ready**: Compatible with [Maestro Cloud](https://cloud.mobile.dev/) via `mobile-dev-inc/action-maestro-cloud@v1`.
