import React, { createContext, useContext, ReactNode } from 'react';
import { AppConfig, defaultAppConfig } from '../appConfig';

export const ConfigContext = createContext<AppConfig>(defaultAppConfig);

export interface ConfigProviderProps {
  children: ReactNode;
  config?: AppConfig;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  config = defaultAppConfig,
}) => {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export const useAppConfig = (): AppConfig => {
  const context = useContext(ConfigContext);
  return context ?? defaultAppConfig;
};
