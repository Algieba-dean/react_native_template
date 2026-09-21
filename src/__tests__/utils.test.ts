import {
  logger,
  isIOS,
  isAndroid,
  getWindowDimensions,
  getScreenDimensions,
} from '../shared/utils';

describe('Shared Utilities', () => {
  describe('Logger', () => {
    let debugSpy: jest.SpyInstance;
    let infoSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should log messages when enabled', () => {
      logger.setEnabled(true);
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(debugSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should suppress debug/info/warn when disabled, but keep error', () => {
      logger.setEnabled(false);
      logger.debug('debug hidden');
      logger.info('info hidden');
      logger.warn('warn hidden');
      logger.error('error always shown');

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Platform utils', () => {
    it('should export platform constants and dimension helpers', () => {
      expect(typeof isIOS).toBe('boolean');
      expect(typeof isAndroid).toBe('boolean');
      expect(getWindowDimensions()).toBeDefined();
      expect(getScreenDimensions()).toBeDefined();
    });
  });
});
