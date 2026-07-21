import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

const logLevel =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});
