import React from 'react';
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from '../shared/navigation/RootNavigator';
import { AppConfig } from './appConfig';

export interface AppProps {
  config?: AppConfig;
}

export const App: React.FC<AppProps> = ({ config }) => {
  return (
    <AppProviders config={config}>
      <RootNavigator />
    </AppProviders>
  );
};

export default App;
