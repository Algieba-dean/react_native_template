# Clean Architecture & Layering Conventions

This template adheres to the principles of Clean Architecture adapted for React Native development.

```
       Presentation Layer (UI, Screens, Hooks, Modals)
                       │
                       ▼
       Domain Layer (Pure TypeScript: Entities, Services, Invariants)
                       ▲
                       │
       Data Layer (Repositories, Adapters, Storage, API Clients)
```

---

## 1. Layer Definitions & Boundaries

### 1.1 Domain Layer (`src/domain` or `src/features/*/domain`)
- **Strictly pure TypeScript**: Zero imports from `react`, `react-native`, or UI libraries.
- Contains business entity interfaces, value objects, domain calculation services, validation schemas, and repository interfaces.
- Completely unit testable in pure Node.js environments without DOM or React rendering.

### 1.2 Data Layer (`src/data` or `src/features/*/data`)
- Implements repository interfaces defined by the domain layer.
- Handles disk serialization, network calls, cache invalidation, and data hydration.
- Converts raw database/API models into clean domain entities.

### 1.3 Presentation Layer (`src/features/*/presentation`)
- Contains React components, screen containers, forms, modals, and presentation hooks.
- Accesses business state via domain repositories or React context providers.
- Never directly writes raw JSON files or makes direct un-intercepted HTTP calls.

### 1.4 Shared Layer (`src/shared`)
- Reusable cross-cutting capabilities:
  - `theme/`: Design tokens, colors, typography, touch target constants.
  - `localization/`: i18n dictionaries and translator helpers.
  - `services/`: Base HTTP `ApiClient`, `storageService`, `SafePersistenceStore`.
  - `utils/`: `structuredLogger`, platform helpers.

---

## 2. Inward Dependency Rule

Dependencies always point inwards toward domain business logic:
- Presentation depends on Domain.
- Data depends on Domain.
- **Domain depends on nothing external.**

This ensures business logic survives changes to UI design systems, navigation libraries, or backend databases.
