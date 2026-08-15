import pino from 'pino';
import * as Sentry from '@sentry/node';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

export function captureException(err: unknown) {
  try {
    logger.error(err as any);
    if (process.env.SENTRY_DSN) Sentry.captureException(err);
  } catch (e) {
    // swallow
  }
}

export default logger;
