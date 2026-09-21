export type SupportedLanguage = 'en' | 'zh-Hans';

export interface TranslationSchema {
  appTitle: string;
  templateSummary: string;
  runtimeEnvironmentTitle: string;
  environment: {
    development: string;
    staging: string;
    production: string;
  };
  features: {
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    language: string;
    languageEn: string;
    languageZh: string;
    networkStatus: string;
    healthy: string;
  };
  common: {
    confirm: string;
    cancel: string;
    retry: string;
    error: string;
  };
}
