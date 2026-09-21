import React, { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppConfig } from '../appConfig';
import { ConfigProvider } from './ConfigProvider';
import { ThemeProvider } from './ThemeProvider';
import { LocalizationProvider } from './LocalizationProvider';
import { QueryProvider } from './QueryProvider';
import { ErrorBoundary } from '../ErrorBoundary';

export interface AppProvidersProps {
  children: ReactNode;
  config?: AppConfig;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children, config }) => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ConfigProvider config={config}>
          <QueryProvider>
            <LocalizationProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </LocalizationProvider>
          </QueryProvider>
        </ConfigProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};
