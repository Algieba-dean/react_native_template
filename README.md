# Enterprise React Native Application Template

<div align="center">

[![CI](https://github.com/Algieba-dean/react_native_template/actions/workflows/ci.yml/badge.svg)](https://github.com/Algieba-dean/react_native_template/actions/workflows/ci.yml)
[![Maestro E2E](https://github.com/Algieba-dean/react_native_template/actions/workflows/maestro.yml/badge.svg)](https://github.com/Algieba-dean/react_native_template/actions/workflows/maestro.yml)
[![Security Scan](https://github.com/Algieba-dean/react_native_template/actions/workflows/security.yml/badge.svg)](https://github.com/Algieba-dean/react_native_template/actions/workflows/security.yml)
[![codecov](https://codecov.io/gh/Algieba-dean/react_native_template/branch/main/graph/badge.svg)](https://codecov.io/gh/Algieba-dean/react_native_template)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg?logo=react)](https://reactnative.dev/)
[![Maestro](https://img.shields.io/badge/E2E-Maestro-blueviolet.svg)](https://maestro.mobile.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/workflow.md)

**An enterprise-grade, production-ready React Native template built with Clean Architecture, Feature-First organization, strict TypeScript, design tokens, multi-environment configuration, Maestro E2E simulation testing, and full GitHub Actions CI/CD automation.**

[English](#english) | [中文说明](#chinese)

</div>

---

<a name="english"></a>
## 🚀 Features

- 🏗️ **Clean Architecture + Feature-First**: Strict layer boundaries (`src/app`, `src/features`, `src/shared`) for maximum scalability and maintainability.
- ⚡ **TypeScript Strict Mode**: 100% type-safe codebase with absolute path aliases (`@app/*`, `@features/*`, `@shared/*`).
- 🌍 **Runtime Multi-Environment Configuration**: Built-in environment switching (`development`, `staging`, `production`) with strongly-typed `AppConfig` and React context `ConfigProvider` (`useAppConfig()`).
- 🎨 **Design Token Theme System**: Dynamic Light/Dark/System modes with unified typography scales, color palettes, elevation, and spacing matrix.
- 🌐 **Internationalization (i18n)**: Out-of-the-box multi-language support (English and Simplified Chinese) with nested keys and dynamic locale switching.
- 📡 **Enterprise API & Storage**: Typed Axios HTTP client with request/response interceptors, standardized error handling (`ApiError`), and pluggable storage abstraction.
- 🛡️ **Crash Resilience & Error Boundary**: Safe zone bootstrapping with Hermes promise rejection tracking and UI error boundaries with recovery mechanisms.
- 🧪 **Comprehensive Testing & Maestro E2E**: Configured Jest test runner, React Native Testing Library, and full Maestro declarative E2E simulation testing suite (`.maestro/`) with system dialogs and file handling.
- 🛠️ **Developer Tooling & Makefile**: Automation CLI (`tool/init_project.js`), Lefthook pre-commit hooks, Maestro Studio inspector, and unified `Makefile` for one-command developer workflows.
- 🤖 **CI/CD Automation & AI Skills**: Embedded AI agent skills (`skills/`), GitHub Actions for CI, Maestro E2E matrix, Security (CodeQL + audit), Semantic PR, Labels sync, and Fastlane deployment guides.

---

## 📁 Project Structure

```
.
├── .github/                     # GitHub Actions CI/CD workflows and repository templates
│   ├── workflows/               # CI, Maestro E2E, Security, Semantic PR, Release Drafter, Labels
│   ├── ISSUE_TEMPLATE/          # Issue templates for Bug, Feature, Task
│   ├── codecov.yml              # Code coverage threshold rules
│   ├── dependabot.yml           # Automated dependency updates
│   └── pull_request_template.md # Standard PR review checklist
├── .maestro/                    # Maestro End-to-End simulation testing flows
│   ├── config.yaml              # Global suite configuration & appId mapping
│   └── flows/                   # Declarative test flows (launch, theme, i18n, system dialogs)
├── docs/                        # Engineering guides and architecture decisions
│   ├── adr/                     # Architecture Decision Records
│   ├── checklists/              # Operational release checklists
│   ├── architecture.md          # Architectural layer rules and design principles
│   ├── e2e-testing-maestro.md   # Maestro E2E simulation testing guide & best practices
│   ├── fastlane.md              # Fastlane deployment guide
│   ├── new-architecture.md      # React Native New Architecture (Fabric / TurboModules) guide
│   ├── splash-screen.md         # Native splash screen setup guide
│   ├── code-style.md            # Coding standards and linting rules
│   ├── configuration.md         # Multi-environment configuration guide
│   ├── localization.md          # Translation guide and locale management
│   ├── react-native-project-workflow.md # Project lifecycle workflow
│   ├── testing.md               # Unit, component, and E2E testing guide
│   └── workflow.md              # Branching strategy and PR guidelines
├── skills/                      # AI Agent workflows & skills (Flutter template parity)
│   ├── react-native-daily-development/ # Daily development, feature & component authoring
│   └── react-native-template-workflow/ # Architecture rules, ADR, release & CI guide
├── src/
│   ├── app/                     # Application shell, bootstrap, and providers
│   │   ├── providers/           # ConfigProvider, ThemeProvider, LocalizationProvider, QueryProvider
│   │   ├── appConfig.ts         # Strongly typed runtime configuration singleton
│   │   ├── bootstrap.ts         # Zone-guarded bootstrap & Hermes crash tracking
│   │   ├── ErrorBoundary.tsx    # Uncaught UI error boundary with recovery
│   │   └── App.tsx              # Root container component
│   ├── features/                # Business feature slices
│   │   └── home/                # Home screen feature slice (cards, toggles)
│   ├── shared/                  # Reusable foundation modules
│   │   ├── components/          # Design system atomic components (Text, Button, Card, Badge, ScreenContainer)
│   │   ├── localization/        # i18n initialization & locale resource dictionaries
│   │   ├── navigation/          # React Navigation root stack and route types
│   │   ├── services/            # Axios API client, storage service interface
│   │   ├── theme/               # Design tokens (colors, typography, spacing)
│   │   └── utils/               # Logger, platform helpers
│   └── __tests__/               # Automated unit & integration test suites
├── tool/
│   └── init_project.js          # Interactive project rename & initialization CLI
├── .env.development             # Development environment variables
├── .env.staging                 # Staging environment variables
├── .env.production              # Production environment variables
├── .lefthook.yml                # Pre-commit & commit-msg Git hooks
├── Makefile                     # Make command automation
└── package.json                 # Project dependencies and npm scripts
```

---

## 🛠️ Quick Start

### Prerequisites
- Node.js `>= 18.0.0`
- npm, pnpm, or yarn
- React Native CLI development environment ([Official Guide](https://reactnative.dev/docs/environment-setup))
- Xcode (for iOS) & Android Studio (for Android)
- Maestro CLI (`curl -FsSL "https://get.maestro.mobile.dev" | bash`)

### Quick Initialization (Template Cloner)
```bash
# Clone the repository
git clone https://github.com/Algieba-dean/react_native_template.git my-app
cd my-app

# Run the interactive project initializer (renames app, bundle ID, resets Git)
node tool/init_project.js

# Install dependencies and verify
make setup
make check
```

### Daily Development Commands

```bash
# Start Metro bundler
make start

# Run on iOS simulator
make run-ios

# Run on Android emulator / device
make run-android

# Run full quality gates (lint, format:check, typecheck, test)
make check

# Run Maestro E2E test flows
make test-e2e

# Launch interactive Maestro Studio inspector
make e2e-studio
```

---

## 📜 Available Commands & Scripts

| Makefile Target | npm Script | Description |
| :--- | :--- | :--- |
| `make setup` | `npm install` | Installs project dependencies |
| `make start` | `npm start` | Starts the Metro local bundler |
| `make check` | `lint + format:check + typecheck + test` | Runs all CI quality gates |
| `make run-ios` | `npm run ios` | Builds and runs app on iOS Simulator |
| `make run-android` | `npm run android` | Builds and runs app on Android Emulator |
| `make lint` | `npm run lint` | Analyzes code for ESLint errors |
| `make format` | `npm run format` | Formats all source files with Prettier |
| `make format-check`| `npm run format:check`| Verifies formatting compliance |
| `make typecheck` | `npm run typecheck` | Validates TypeScript types with `tsc --noEmit` |
| `make test` | `npm test` | Runs Jest unit and component test suites |
| `make test-coverage`| `npm run test:coverage`| Runs test suite and outputs coverage report |
| `make test-e2e` | `npm run test:e2e` | Runs Maestro End-to-End simulation test flows |
| `make e2e-studio` | `npm run test:e2e:studio` | Launches interactive Maestro Studio inspector |
| `make clean` | `npm run clean` | Cleans build caches and generated artifacts |

---

## ⚙️ Multi-Environment Configuration

Access strongly typed runtime configuration anywhere in your code via `useAppConfig()` hook:

```typescript
import { useAppConfig } from '@app/providers/ConfigProvider';

const MyComponent = () => {
  const config = useAppConfig();

  return <Text>{config.environment}: {config.apiBaseUrl}</Text>;
};
```

---

<a name="chinese"></a>
## 🇨🇳 中文说明

### 核心特性

- 🏗️ **整洁架构 + 特性优先 (Clean Architecture + Feature-First)**: 清晰的代码分层治理（`src/app` 顶层装配、`src/features` 业务特性切片、`src/shared` 通用基建与设计系统），天然支持团队并行研发与长期扩展。
- ⚡ **全链路严格 TypeScript**: 开启严格模式，配置全路径别名（`@app/*`, `@features/*`, `@shared/*`），杜绝类型黑洞。
- 🌍 **运行时多环境动态注入**: 开箱即用的三套环境配置（`development` / `staging` / `production`），搭配强类型 `AppConfig` 与 React Context `ConfigProvider` (`useAppConfig()`)。
- 🎨 **设计令牌主题系统 (Design Tokens)**: 完整的明暗色彩、文字字阶、间距网格与圆角阴影体系，支持动态热切换与本地持久化。
- 🌐 **多语言国际化 (i18n)**: 集成 `react-i18next`，内置中英文对照词典，支持运行时动态语言切换。
- 📡 **企业级网络层与缓存**: 基于 Axios 封装的统一 HTTP 客户端，具备请求/响应拦截、Token 鉴权注入与标准化 `ApiError` 异常转换；集成 React Query 服务端状态管理。
- 🛡️ **高可用与崩溃恢复**: Zone-guarded 安全启动周期，配合 Hermes Promise 追踪与全局 UI `ErrorBoundary` 实现优雅降级与重试机制。
- 🧪 **自动化测试与 Maestro 端到端仿真**: 配置完整的 Jest 与 React Native Testing Library 测试套件及覆盖率阈值监控，集成 Maestro 声明式 E2E 仿真测试框架（冷启动、主题切换、多语言国际化验证、系统权限与文件选择模拟）。
- 🛠️ **自动化脚本与脚手架**: 内置 `node tool/init_project.js` 一键定制改名与 Git 初始化，配合 Lefthook 与 `Makefile` 一键执行质量门禁与 Maestro Studio。
- 🤖 **全套 GitHub Actions CI/CD 与 AI Agent Skills**: 深度对齐 Flutter 模版的 AI 技能工作流，覆盖日常开发、架构治理、Maestro E2E 矩阵与 Fastlane 发版指引。

---

## 📚 详细文档导航 / Documentation Index

- [🏛️ 架构设计规范 / Architecture Guide](docs/architecture.md)
- [🎭 Maestro 端到端仿真测试 / Maestro E2E Testing Guide](docs/e2e-testing-maestro.md)
- [🚀 Fastlane 自动化发版 / Fastlane Guide](docs/fastlane.md)
- [⚡ 新架构适配说明 / New Architecture Guide](docs/new-architecture.md)
- [📱 原生启动屏配置 / Splash Screen Guide](docs/splash-screen.md)
- [🎨 代码风格指南 / Code Style Guide](docs/code-style.md)
- [⚙️ 多环境配置说明 / Configuration Guide](docs/configuration.md)
- [🌐 多语言国际化配置 / Localization Guide](docs/localization.md)
- [🧪 测试策略与规范 / Testing Guide](docs/testing.md)
- [🔄 研发与协作流程 / Workflow Guide](docs/workflow.md)
- [📋 发版验证核对单 / Release Checklist](docs/checklists/release.md)
- [📐 架构决策记录 / ADR 0001](docs/adr/0001-repository-template-baseline.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
