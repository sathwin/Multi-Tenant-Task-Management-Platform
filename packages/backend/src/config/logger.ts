import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaString = '';
    
    if (Object.keys(meta).length > 0) {
      metaString = `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

// Format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  levels,
  format: process.env.NODE_ENV === 'development' ? developmentFormat : productionFormat,
  defaultMeta: {
    service: 'task-platform-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create a stream object for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
export const logError = (message: string, error: Error, context?: any) => {
  logger.error(message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  });
};

export const logInfo = (message: string, context?: any) => {
  logger.info(message, context);
};

export const logDebug = (message: string, context?: any) => {
  logger.debug(message, context);
};

export const logWarn = (message: string, context?: any) => {
  logger.warn(message, context);
};

// Performance logging utility
export const performanceLogger = (operation: string) => {
  const start = Date.now();
  
  return {
    end: (context?: any) => {
      const duration = Date.now() - start;
      logger.debug(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        ...context,
      });
    },
  };
};

// Workspace context logger
export const createWorkspaceLogger = (workspaceId: string, userId?: string) => {
  return {
    info: (message: string, meta?: any) => {
      logger.info(message, { workspaceId, userId, ...meta });
    },
    error: (message: string, error?: Error, meta?: any) => {
      logError(message, error as Error, { workspaceId, userId, ...meta });
    },
    debug: (message: string, meta?: any) => {
      logger.debug(message, { workspaceId, userId, ...meta });
    },
    warn: (message: string, meta?: any) => {
      logger.warn(message, { workspaceId, userId, ...meta });
    },
  };
};

export default logger; 