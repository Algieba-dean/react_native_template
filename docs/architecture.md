# Architecture Guide

This project follows Clean Architecture principles combined with Feature-First modular decomposition tailored for React Native applications.

```
src/
├── app/                 # Application shell, bootstrap, providers, global error boundary
│   ├── providers/       # Theme, Localization, React Query, Safe Area contexts
│   ├── appConfig.ts     # Strongly typed multi-environment runtime configuration
│   ├── bootstrap.ts     # Zone-guarded bootstrap lifecycle & crash reporting
│   └── ErrorBoundary.tsx# Fallback UI for uncaught rendering errors
├── features/            # Business feature slices
│   └── home/            # Home feature
│       ├── presentation/# UI screens & presentation components
│       └── types/       # Feature-specific type definitions
├── shared/              # Reusable foundation modules
│   ├── components/      # Design system atomic & compound UI components
│   ├── localization/    # i18n initialization, types, and translation dictionaries
│   ├── navigation/      # React Navigation stacks, navigators, and linking
│   ├── services/        # HTTP client (Axios), offline storage, device sensors
│   ├── theme/           # Design tokens (colors, typography, spacing, border radiuses)
│   └── utils/           # Platform helpers, logger, formatters
└── __tests__/           # Unit and component test suites
```

## Layer Separation & Rules

1. **`app/`**:
   Responsible for top-level bootstrap, global error catching, context injection, and root lifecycle. Does not contain domain business logic.
2. **`features/`**:
   Grouped by domain functionality (`home`, `auth`, `profile`, `checkout`, etc.). Each feature encapsulates its own presentation, hooks, API queries, and models.
3. **`shared/`**:
   Cross-cutting infrastructure and reusable components. Shared modules must never import from `features/`.
4. **`services/`**:
   External boundary implementations (HTTP, Storage, Push Notifications). Exposes typed interfaces so mock implementations can be swapped during testing.
