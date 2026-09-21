---
name: react-native-daily-development
description: Daily development workflows, feature creation guide, component authoring, and testing patterns for React Native enterprise template
---

# React Native Daily Development Guide

This skill guide outlines standard engineering patterns, development workflows, feature implementation processes, and testing conventions for this React Native enterprise starter template.

---

## 1. Daily Development Workflows

### Starting the Development Environment
```bash
# Start Metro bundler
npm start
# or with Makefile
make start

# Run on iOS simulator
npm run ios
# or
make run-ios

# Run on Android emulator / device
npm run android
# or
make run-android
```

### Environment Switching
Environments are defined in `.env.development`, `.env.staging`, and `.env.production`.
Runtime configuration is loaded via `createAppConfig()` and injected via `<ConfigProvider>`.

```ts
import { useAppConfig } from '@app/providers/ConfigProvider';

const config = useAppConfig();
console.log(config.environment, config.apiBaseUrl);
```

---

## 2. Feature Creation Guide (Feature-First Architecture)

Every feature lives under `src/features/<feature_name>/` and follows clean architecture layering:

```
src/features/sample/
├── data/
│   ├── datasources/        # Remote and local data sources (Axios API calls, AsyncStorage)
│   ├── models/             # Data transfer objects (DTOs) and serialization/deserialization
│   └── repositories/       # Concrete implementation of domain repository interfaces
├── domain/
│   ├── entities/           # Business entities and value objects
│   ├── repositories/       # Abstract repository interfaces
│   └── usecases/           # Business logic orchestrators / use cases
├── presentation/
│   ├── components/         # Feature-specific subcomponents
│   ├── hooks/              # Feature-specific custom hooks (TanStack Query hooks, state)
│   └── screens/            # Main screen components registered in navigation
└── types/
    └── index.ts            # Type declarations exported by the feature
```

### Step-by-Step Feature Implementation Flow

1. **Domain Layer**:
   - Define entity types in `domain/entities/<entity>.ts`.
   - Define repository interface in `domain/repositories/<entity>Repository.ts`.
2. **Data Layer**:
   - Implement remote datasource using `apiClient` (`src/shared/services/api/apiClient.ts`).
   - Implement repository interface in `data/repositories/<entity>RepositoryImpl.ts`.
3. **Presentation Layer**:
   - Create custom React Query hook in `presentation/hooks/use<Feature>Query.ts`.
   - Build UI components in `presentation/components/`.
   - Build Screen component wrapping root content in `ScreenContainer`.
4. **Navigation Integration**:
   - Register screen in `src/shared/navigation/types.ts` (`RootStackParamList`).
   - Add `<Stack.Screen name="..." component={...} />` in `src/shared/navigation/RootNavigator.tsx`.

---

## 3. Component Authoring Standards

### Rules for UI Components
1. **Theming**: Never hardcode colors or spacing. Always consume `useTheme()`.
2. **Localization**: Never hardcode user-facing strings. Always use `useLocalization()` with `t('key')`.
3. **Safe Area Handling**: Use `<ScreenContainer>` for full-screen containers. Set `safeTop={false}` (default) when under standard navigation headers to prevent double padding.
4. **Accessibility**: Provide `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` for interactive components (`AppButton`, `TouchableOpacity`).
5. **Path Aliases**: Always use `@app/*`, `@features/*`, `@shared/*` instead of multi-level `../../..` relative paths.

### Component Skeleton Example
```tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { useLocalization } from '@app/providers/LocalizationProvider';
import { AppText, AppCard } from '@shared/components';

export interface UserCardProps {
  name: string;
  email: string;
  style?: ViewStyle;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, style }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();

  return (
    <AppCard style={[styles.card, style]}>
      <AppText variant="titleMedium" color={theme.colors.text}>
        {name}
      </AppText>
      <AppText variant="bodySmall" color={theme.colors.subtext}>
        {email}
      </AppText>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
});
```

---

## 4. Testing Patterns & Verification

### Unit & Component Testing with Jest + React Native Testing Library
All tests reside in `src/__tests__/` or alongside modules as `*.test.tsx` / `*.test.ts`.

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppProviders } from '@app/providers/AppProviders';
import { AppButton } from '@shared/components';

describe('AppButton Component', () => {
  it('renders button title correctly and handles press', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AppProviders>
        <AppButton title="Submit" onPress={onPressMock} />
      </AppProviders>
    );

    const button = getByText('Submit');
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

### Pre-commit Verification Commands
Run the complete quality gate before committing:
```bash
make check
# Equivalent to:
# npm run lint && npm run format:check && npm run typecheck && npm test
```
