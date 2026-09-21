import { AppEnvironment, AppEnvironmentUtils, createAppConfig } from '../app/appConfig';

describe('AppConfig & AppEnvironmentUtils', () => {
  it('should parse environment strings accurately', () => {
    expect(AppEnvironmentUtils.parse('production')).toBe(AppEnvironment.production);
    expect(AppEnvironmentUtils.parse('prod')).toBe(AppEnvironment.production);
    expect(AppEnvironmentUtils.parse('staging')).toBe(AppEnvironment.staging);
    expect(AppEnvironmentUtils.parse('stage')).toBe(AppEnvironment.staging);
    expect(AppEnvironmentUtils.parse('development')).toBe(AppEnvironment.development);
    expect(AppEnvironmentUtils.parse('unknown')).toBe(AppEnvironment.development);
  });

  it('should format environment labels accurately', () => {
    expect(AppEnvironmentUtils.getLabel(AppEnvironment.development)).toBe('Development');
    expect(AppEnvironmentUtils.getLabel(AppEnvironment.staging)).toBe('Staging');
    expect(AppEnvironmentUtils.getLabel(AppEnvironment.production)).toBe('Production');
  });

  it('should create default configuration correctly', () => {
    const config = createAppConfig({
      environment: AppEnvironment.staging,
      apiBaseUrl: 'https://staging.api.custom.com',
    });

    expect(config.environment).toBe(AppEnvironment.staging);
    expect(config.apiBaseUrl).toBe('https://staging.api.custom.com');
  });
});
