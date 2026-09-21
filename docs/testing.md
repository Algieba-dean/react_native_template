# Testing Strategy

This project maintains a robust pyramid testing strategy:

1. **Unit Tests**:
   - Tests pure functions, utility methods, configuration parsers, and API adapters in isolation using Jest.
2. **Component & Presentation Tests**:
   - Tests React Native UI components with `@testing-library/react-native` to verify user interaction, accessibility, and state rendering.
3. **Integration Tests**:
   - Tests navigation flows and multi-step state mutations.
4. **End-to-End (E2E) Simulation Tests**:
   - Uses [Maestro](https://maestro.mobile.dev/) for full black-box user scenario automation, native OS dialog handling, and UI flow validation. See [Maestro E2E Testing Guide](e2e-testing-maestro.md).

## Running Tests

### Unit & Component Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate code coverage report
npm run test:coverage
```

### End-to-End (E2E) Simulation Tests (Maestro)

```bash
# Run all Maestro E2E flows
npm run test:e2e
# or
make test-e2e

# Launch interactive Maestro Studio (visual inspector & flow creator)
npm run test:e2e:studio
# or
make e2e-studio
```

For complete details on writing flows, handling OS dialogs, and CI setup, refer to [Maestro E2E Guide](e2e-testing-maestro.md).
