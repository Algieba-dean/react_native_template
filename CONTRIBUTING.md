# Contributing to Enterprise React Native Template

Thank you for your interest in contributing to this project! We welcome community contributions, bug reports, and feature requests.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/Algieba-dean/react_native_template.git
   cd react_native_template
   ```

2. **Install Dependencies**:
   ```bash
   make setup
   # or npm install
   ```

3. **Verify Everything Works**:
   ```bash
   make check
   ```

---

## Development Standards & Git Workflow

1. **Branch Naming**:
   - `feature/short-description`
   - `fix/short-description`
   - `docs/short-description`
   - `refactor/short-description`

2. **Commit Messages**:
   We strictly follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(scope): add new feature`
   - `fix(scope): resolve issue with layout`
   - `docs(scope): update ADR documentation`
   - `test(scope): add unit tests for ScreenContainer`
   - `refactor(scope): streamline theme provider`
   - `chore(scope): update dependencies`

3. **Quality Gates**:
   Before submitting your Pull Request, run the automated checks:
   ```bash
   make check
   make test-coverage
   ```

4. **Writing Tests**:
   - Write unit and component tests for any new utilities, hooks, or components.
   - Maintain minimum test coverage across statements, branches, and functions.

---

## Submitting a Pull Request

1. Push your branch to your fork.
2. Open a Pull Request against the `main` branch.
3. Complete the PR template checklist.
4. Ensure CI checks pass cleanly.
