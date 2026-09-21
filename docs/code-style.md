# Code Style Guide

This project enforces strict code style, formatting, and linting standards across all TypeScript and React Native components.

## TypeScript Standards

- **Strict Mode**: `strict: true` is enabled in `tsconfig.json`. Explicit types are required for public APIs and exported functions.
- **No `any`**: Avoid `any` whenever possible; use `unknown`, generics, or concrete interfaces.
- **Path Aliases**: Use path aliases (`@/`, `@app/`, `@features/`, `@shared/`) rather than fragile relative imports (`../../../`).

## React & React Native Best Practices

- **Functional Components & Hooks**: All UI components are written as functional components with React Hooks.
- **StyleSheets**: Use `StyleSheet.create` for styling to gain native caching benefits and keep render methods clean.
- **Design Tokens**: Do not hardcode hex colors or arbitrary pixel values; reference `theme.colors` and `theme.spacing` from `useTheme()`.
- **Localization**: Never hardcode user-facing copy; wrap strings in `t('key')` from `useLocalization()`.

## Formatting & Verification

Run these commands prior to committing:

```bash
# Type check
npm run typecheck

# Lint check & fix
npm run lint
npm run lint:fix

# Prettier format
npm run format
```
