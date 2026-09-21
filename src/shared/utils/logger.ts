import { defaultAppConfig } from '@app/appConfig';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private enabled: boolean;

  constructor(enabled: boolean = defaultAppConfig.enableLogs) {
    this.enabled = enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private format(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.enabled && level !== 'error') {
      return;
    }

    const timestamp = new Date().toISOString();
    const tag = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(tag, message, ...args);
        break;
      case 'info':
        console.info(tag, message, ...args);
        break;
      case 'warn':
        console.warn(tag, message, ...args);
        break;
      case 'error':
        console.error(tag, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]) {
    this.format('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.format('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.format('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.format('error', message, ...args);
  }
}

export const logger = new Logger();
