# AI Agent & Engineering Workflow Guidelines

Guidelines for automated AI agents and human developers collaborating on projects derived from this template.

---

## 1. Ground Truth & Evidence-Based Verification

- **Never report assumptions as proven facts**: Differentiate between "code compiles theoretically" and "tests actually passed".
- **Real Test Runs**: Always execute `npm test`, `npm run typecheck`, and `npm run lint` before claiming a task is done.
- **No Mock-Only Complacency**: Unit test passes do not prove native build viability. Validate native configurations against real compiler and bundling constraints.
- **Preserve Existing Tests**: Never delete or weaken test assertions merely to make a broken change appear green.

---

## 2. Clean Layer Boundaries & Decoupling

- Business entities must remain pure TypeScript domain objects with zero dependencies on React Native UI or specific persistence engines.
- Domain rules belong in domain services, not in screen components or button `onPress` callbacks.
- Storage adapters must implement clean interfaces (`IStorageService`) allowing painless replacement between in-memory mocks, AsyncStorage, and native file storage.

---

## 3. Visual & Iconography Standards

- **Strict Zero-Emoji Policy**: Emojis render inconsistently across Android vendors (Samsung, Xiaomi, Google) and iOS versions. Always use consistent vector icons or pure line SVG/geometry.
- **Accessibility by Default**: Ensure touch targets meet 44x44pt minimums, provide `accessibilityLabel` attributes, and respect WCAG AA contrast standards.
