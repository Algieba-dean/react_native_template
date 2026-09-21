import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';

export const defaultNS = 'translation';
export const resources = {
  en: { translation: en },
  'zh-Hans': { translation: zhHans },
} as const;

export const initI18n = async (initialLocale: string = 'en') => {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      lng: initialLocale,
      fallbackLng: 'en',
      resources,
      defaultNS,
      interpolation: {
        escapeValue: false,
      },
    });
  }
  return i18n;
};

export default i18n;
