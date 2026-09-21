export enum AppEnvironment {
  development = 'development',
  staging = 'staging',
  production = 'production',
}

export namespace AppEnvironmentUtils {
  export function parse(value?: string): AppEnvironment {
    const normalized = (value || '').trim().toLowerCase();
    switch (normalized) {
      case 'prod':
      case 'production':
        return AppEnvironment.production;
      case 'stage':
      case 'staging':
        return AppEnvironment.staging;
      default:
        return AppEnvironment.development;
    }
  }

  export function getLabel(env: AppEnvironment): string {
    switch (env) {
      case AppEnvironment.development:
        return 'Development';
      case AppEnvironment.staging:
        return 'Staging';
      case AppEnvironment.production:
        return 'Production';
    }
  }
}

export interface AppConfig {
  readonly environment: AppEnvironment;
  readonly apiBaseUrl: string;
  readonly enableLogs: boolean;
  readonly timeoutMs: number;
  readonly appTitle: string;
}

export const createAppConfig = (overrides: Partial<AppConfig> = {}): AppConfig => {
  const envName = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  const environment = AppEnvironmentUtils.parse(envName);

  const defaultApiUrls: Record<AppEnvironment, string> = {
    [AppEnvironment.development]: 'https://api-dev.example.com',
    [AppEnvironment.staging]: 'https://api-staging.example.com',
    [AppEnvironment.production]: 'https://api.example.com',
  };

  return {
    environment: overrides.environment ?? environment,
    apiBaseUrl: overrides.apiBaseUrl ?? process.env.API_BASE_URL ?? defaultApiUrls[environment],
    enableLogs:
      overrides.enableLogs ??
      (process.env.ENABLE_LOGS === 'true' || environment !== AppEnvironment.production),
    timeoutMs: overrides.timeoutMs ?? (environment === AppEnvironment.production ? 10000 : 15000),
    appTitle: overrides.appTitle ?? process.env.APP_TITLE ?? 'Enterprise React Native Template',
  };
};

export const defaultAppConfig = createAppConfig();
