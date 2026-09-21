import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { App } from './src/app/App';
import { bootstrap } from './src/app/bootstrap';
import { AppConfig } from './src/app/appConfig';

const RootApp: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    bootstrap().then(result => {
      setConfig(result.config);
      setIsReady(result.isReady);
    });
  }, []);

  if (!isReady || !config) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <App config={config} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default RootApp;
