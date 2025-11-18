/**
 * Sentry Error Monitoring Configuration
 * @module utils/sentry
 */

// Note: Install with: npm install @sentry/node @sentry/profiling-node

const logger = require('./logger');

let Sentry = null;

// Lazy load Sentry only if configured
const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    logger.warn('Sentry DSN not configured - error monitoring disabled');
    return null;
  }

  try {
    // Dynamic import to avoid errors if not installed
    const SentryNode = require('@sentry/node');
    const { ProfilingIntegration } = require('@sentry/profiling-node');

    SentryNode.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new ProfilingIntegration(),
      ],
      beforeSend(event, hint) {
        // Don't send errors in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV) {
          logger.warn('Sentry event suppressed in development:', event.exception);
          return null;
        }
        return event;
      },
      ignoreErrors: [
        // Ignore common non-critical errors
        'NetworkError',
        'Non-Error promise rejection captured',
        /^Timeout/,
      ],
    });

    logger.info('Sentry initialized successfully');
    return SentryNode;
  } catch (error) {
    logger.error('Failed to initialize Sentry:', error.message);
    return null;
  }
};

// Initialize on first require
if (!Sentry && process.env.SENTRY_DSN) {
  Sentry = initSentry();
}

/**
 * Middleware to attach Sentry handlers to Express
 * @returns {Object} Object containing request and error handlers
 */
const sentryMiddleware = () => {
  if (!Sentry) {
    return {
      requestHandler: (req, res, next) => next(),
      errorHandler: (err, req, res, next) => next(err),
    };
  }

  return {
    requestHandler: Sentry.Handlers.requestHandler(),
    errorHandler: Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all errors with status >= 500
        return error.status >= 500;
      },
    }),
  };
};

/**
 * Manually capture an exception
 * @param {Error} error - Error to capture
 * @param {Object} [context] - Additional context
 */
const captureException = (error, context = {}) => {
  if (Sentry) {
    Sentry.captureException(error, { extra: context });
  } else {
    logger.error('Error occurred (Sentry not configured):', {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }
};

/**
 * Capture a message
 * @param {string} message - Message to capture
 * @param {string} [level='info'] - Severity level
 * @param {Object} [context] - Additional context
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (Sentry) {
    Sentry.captureMessage(message, { level, extra: context });
  } else {
    logger.log(level, message, context);
  }
};

/**
 * Add context to current scope
 * @param {string} key - Context key
 * @param {*} value - Context value
 */
const setContext = (key, value) => {
  if (Sentry) {
    Sentry.setContext(key, value);
  }
};

/**
 * Set user information
 * @param {Object} user - User data
 * @param {string} user.id - User ID
 * @param {string} [user.email] - User email
 * @param {string} [user.username] - Username
 */
const setUser = (user) => {
  if (Sentry) {
    Sentry.setUser(user);
  }
};

module.exports = {
  Sentry,
  sentryMiddleware,
  captureException,
  captureMessage,
  setContext,
  setUser,
};
