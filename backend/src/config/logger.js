import winston from 'winston';
import path from 'path';

// Define log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Custom format combining timestamp, coloring, and print output
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  })
);

// Create the winston logger instance
const logger = winston.createLogger({
  level,
  format: logFormat,
  transports: [
    // Output error logs to error.log
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB limit
      maxFiles: 5,
    }),
    // Output all logs (info, warn, error) to app.log
    new winston.transports.File({ 
      filename: path.join('logs', 'app.log'),
      maxsize: 5242880, // 5MB limit
      maxFiles: 5,
    }),
  ],
});

// If we are not in production, also print to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export default logger;
