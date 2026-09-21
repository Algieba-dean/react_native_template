import { AppConfig, createAppConfig } from './appConfig';
import { initI18n } from '../shared/localization/i18n';
import { logger } from '../shared/utils/logger';

export interface BootstrapResult {
  config: AppConfig;
  isReady: boolean;
}

/**
 * Initializes global error handlers, localization, storage, and application dependencies.
 * Mirrors Flutter's bootstrap zone-guarded pattern.
 */
export async function bootstrap(initialConfig?: AppConfig): Promise<BootstrapResult> {
  const config = initialConfig ?? createAppConfig();

  // Set up global uncaught JS error handler
  if (typeof global !== 'undefined' && (global as any).ErrorUtils) {
    const defaultHandler = (global as any).ErrorUtils.getGlobalHandler?.();
    (global as any).ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      logger.error('Unhandled app error:', { error, isFatal });
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });
  }

  // Set up global promise rejection handler for Hermes & standard JS engines
  if (
    typeof (global as any).HermesInternal !== 'undefined' &&
    typeof (global as any).HermesInternal?.enablePromiseRejectionTracker === 'function'
  ) {
    (global as any).HermesInternal.enablePromiseRejectionTracker({
      allRejections: true,
      onUnhandled: (id: number | string, rejection: any) => {
        logger.error('Unhandled promise rejection (Hermes):', { id, error: rejection });
      },
      onHandled: (id: number | string) => {
        logger.debug(`Handled promise rejection previously unhandled (Hermes): ${id}`);
      },
    });
  } else if (typeof global !== 'undefined') {
    (global as any).onunhandledrejection = (event: any) => {
      logger.error('Unhandled promise rejection:', { reason: event?.reason ?? event });
    };
  }

  try {
    // Initialize i18n
    await initI18n('en');

    logger.info(`App bootstrapped successfully in [${config.environment}] mode`);
    return {
      config,
      isReady: true,
    };
  } catch (err) {
    logger.error('Failed to bootstrap app:', err);
    return {
      config,
      isReady: false,
    };
  }
}
