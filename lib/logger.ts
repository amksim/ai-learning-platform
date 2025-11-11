/**
 * Production-safe logger
 * Логирует только в development режиме
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // В production только критические ошибки
      console.error('[ERROR]', new Date().toISOString());
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  // Для важной информации которую нужно видеть в production
  production: (...args: any[]) => {
    console.log('[PROD]', ...args);
  },
};

export default logger;
