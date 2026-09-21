import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ConfigProvider, useAppConfig } from '../app/providers/ConfigProvider';
import { AppEnvironment, createAppConfig, defaultAppConfig } from '../app/appConfig';

const TestConfigConsumer: React.FC = () => {
  const config = useAppConfig();
  return (
    <>
      <Text testID="env-text">{config.environment}</Text>
      <Text testID="url-text">{config.apiBaseUrl}</Text>
      <Text testID="logs-text">{config.enableLogs ? 'logs-on' : 'logs-off'}</Text>
      <Text testID="title-text">{config.appTitle}</Text>
    </>
  );
};

describe('ConfigProvider & useAppConfig', () => {
  it('provides default app configuration when no config is passed', () => {
    const { getByTestId } = render(
      <ConfigProvider>
        <TestConfigConsumer />
      </ConfigProvider>,
    );

    expect(getByTestId('env-text').props.children).toBe(defaultAppConfig.environment);
    expect(getByTestId('url-text').props.children).toBe(defaultAppConfig.apiBaseUrl);
    expect(getByTestId('title-text').props.children).toBe(defaultAppConfig.appTitle);
  });

  it('provides custom configuration when passed to ConfigProvider', () => {
    const customConfig = createAppConfig({
      environment: AppEnvironment.production,
      apiBaseUrl: 'https://api.custom-prod.com',
      enableLogs: false,
      appTitle: 'Custom Production App',
    });

    const { getByTestId } = render(
      <ConfigProvider config={customConfig}>
        <TestConfigConsumer />
      </ConfigProvider>,
    );

    expect(getByTestId('env-text').props.children).toBe(AppEnvironment.production);
    expect(getByTestId('url-text').props.children).toBe('https://api.custom-prod.com');
    expect(getByTestId('logs-text').props.children).toBe('logs-off');
    expect(getByTestId('title-text').props.children).toBe('Custom Production App');
  });

  it('returns default config when useAppConfig is rendered without explicit provider wrapper', () => {
    const { getByTestId } = render(<TestConfigConsumer />);
    expect(getByTestId('env-text').props.children).toBe(defaultAppConfig.environment);
  });
});
