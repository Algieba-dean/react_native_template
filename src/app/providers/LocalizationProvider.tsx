import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage } from '@shared/localization/types';
import i18n from '@shared/localization/i18n';

interface LocalizationContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [language, setLangState] = useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) || 'en',
  );

  const setLanguage = useCallback(async (newLang: SupportedLanguage) => {
    await i18n.changeLanguage(newLang);
    setLangState(newLang);
  }, []);

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
