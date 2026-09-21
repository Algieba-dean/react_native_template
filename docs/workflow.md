# Development Workflow

This document outlines the standard engineering workflow for developing, testing, and shipping features using this React Native template.

---

## 1. Branching Strategy

We follow Trunk-Based Development with short-lived feature branches:

- **`main`**: Production-ready branch. All merged PRs should be deployable.
- **`feat/<feature-name>`**: New features and capabilities.
- **`fix/<bug-name>`**: Bug fixes and patches.
- **`chore/<task-name>`**: Maintenance, dependency updates, and tooling changes.
- **`refactor/<scope>`**: Code structure improvements without functional changes.
- **`docs/<doc-name>`**: Documentation additions and revisions.

---

## 2. Commit Message Convention

All commits must adhere to [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Supported Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

---

## 3. Local Development Cycle

1. **Checkout a new branch**:
   ```bash
   git checkout -b feat/user-authentication
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the Metro bundler & platform target**:
   ```bash
   npm start
   # In another terminal:
   npm run ios # or npm run android
   ```
4. **Run code quality checks locally**:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

---

## 4. Pull Request Checklist

Before submitting a Pull Request:
- [ ] Code follows project formatting rules (`npm run format:check`).
- [ ] TypeScript compiles cleanly without errors (`npm run typecheck`).
- [ ] Unit & component tests pass with coverage (`npm test -- --coverage`).
- [ ] PR title adheres to Conventional Commits format.
- [ ] PR description includes context, screenshots (for UI changes), and linked issue ticket.

---

## 5. Continuous Integration (CI)

Every PR triggers automated workflows:
1. **CI Pipeline (`ci.yml`)**: Lints codebase, checks TypeScript types, executes Jest test suite, and uploads coverage to Codecov.
2. **Security & Audit (`security.yml`)**: Scans dependencies for known vulnerabilities and runs CodeQL code analysis.
3. **Semantic PR Check (`semantic-pr.yml`)**: Validates PR title conformity to Conventional Commits.
4. **PR Labeler (`pr-labeler.yml`)**: Automatically assigns component/layer labels based on modified paths.
