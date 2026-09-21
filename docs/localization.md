# Localization Guide

Internationalization (i18n) is powered by `i18next` and `react-i18next`.

## Locales

Locale files are stored under `src/shared/localization/locales/`:
- `en.json`: English (default fallback)
- `zh-Hans.json`: Simplified Chinese

## Adding New Translation Keys

1. Add the translation key to `src/shared/localization/types.ts` under `TranslationSchema`.
2. Add the translation values into `en.json` and `zh-Hans.json`.
3. Use the hook in components:

```tsx
import { useLocalization } from '@/app/providers/LocalizationProvider';

export const MyComponent = () => {
  const { t, language, setLanguage } = useLocalization();

  return (
    <Text>{t('appTitle')}</Text>
  );
};
```
