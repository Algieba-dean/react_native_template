import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../features/home/presentation/HomeScreen';
import { AppProviders } from '../app/providers/AppProviders';
import { initI18n } from '../shared/localization/i18n';
import { AppEnvironment, createAppConfig } from '../app/appConfig';

describe('HomeScreen Integration', () => {
  beforeAll(async () => {
    await initI18n('en');
  });

  it('renders home screen elements including title, summary, and environment info', async () => {
    const customConfig = createAppConfig({
      environment: AppEnvironment.staging,
      apiBaseUrl: 'https://api-staging.custom.com',
      appTitle: 'Custom App Title',
    });

    const { getByText } = render(
      <AppProviders config={customConfig}>
        <HomeScreen />
      </AppProviders>,
    );

    expect(getByText('Enterprise React Native Template')).toBeTruthy();
    expect(
      getByText('A production-ready repository baseline for React Native teams.'),
    ).toBeTruthy();
    expect(getByText('Runtime Environment')).toBeTruthy();
    expect(getByText('https://api-staging.custom.com')).toBeTruthy();
    expect(getByText('Staging')).toBeTruthy();
  });

  it('allows switching theme modes between Light, Dark, and System', () => {
    const { getByText } = render(
      <AppProviders>
        <HomeScreen />
      </AppProviders>,
    );

    const darkBtn = getByText('Dark');
    const lightBtn = getByText('Light');
    const systemBtn = getByText('System');

    expect(darkBtn).toBeTruthy();
    expect(lightBtn).toBeTruthy();
    expect(systemBtn).toBeTruthy();

    fireEvent.press(darkBtn);
    fireEvent.press(lightBtn);
    fireEvent.press(systemBtn);
  });

  it('allows switching language between English and Chinese', async () => {
    const { getByText } = render(
      <AppProviders>
        <HomeScreen />
      </AppProviders>,
    );

    const zhBtn = getByText('简体中文');
    expect(zhBtn).toBeTruthy();

    fireEvent.press(zhBtn);

    await waitFor(() => {
      expect(getByText('企业级 React Native 模版')).toBeTruthy();
      expect(getByText('开发环境 (Development)')).toBeTruthy();
    });

    const enBtn = getByText('English');
    fireEvent.press(enBtn);

    await waitFor(() => {
      expect(getByText('Enterprise React Native Template')).toBeTruthy();
      expect(getByText('Development')).toBeTruthy();
    });
  });
});
