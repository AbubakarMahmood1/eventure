/**
 * Sentry Error Monitoring for Frontend
 * @module utils/sentry
 */

// Note: Install with: npm install @sentry/react

let Sentry = null;

/**
 * Initialize Sentry for React application
 * @returns {Object|null} Sentry instance or null
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured - error monitoring disabled');
    return null;
  }

  try {
    // Dynamic import to avoid build errors if not installed
    const SentryReact = require('@sentry/react');

    SentryReact.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        SentryReact.browserTracingIntegration(),
        SentryReact.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      beforeSend(event, hint) {
        // Don't send errors in development unless explicitly enabled
        if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_SENTRY_DEV) {
          console.warn('Sentry event suppressed in development:', event.exception);
          return null;
        }
        return event;
      },

      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        // Random plugins/extensions
        'Can\'t find variable: ZiteReader',
        'jigsaw is not defined',
        'ComboSearch is not defined',
        // Network errors
        'NetworkError',
        'Failed to fetch',
        // React errors that are handled
        'ResizeObserver loop limit exceeded',
      ],
    });

    console.log('Sentry initialized successfully');
    Sentry = SentryReact;
    return SentryReact;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error.message);
    return null;
  }
};

/**
 * Capture an exception
 * @param {Error} error - Error to capture
 * @param {Object} [context] - Additional context
 */
export const captureException = (error, context = {}) => {
  if (Sentry) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error occurred (Sentry not configured):', error, context);
  }
};

/**
 * Capture a message
 * @param {string} message - Message to capture
 * @param {string} [level='info'] - Severity level
 * @param {Object} [context] - Additional context
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (Sentry) {
    Sentry.captureMessage(message, { level, extra: context });
  } else {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
};

/**
 * Set user information
 * @param {Object} user - User data
 */
export const setUser = (user) => {
  if (Sentry) {
    Sentry.setUser(user);
  }
};

/**
 * Clear user information
 */
export const clearUser = () => {
  if (Sentry) {
    Sentry.setUser(null);
  }
};

/**
 * React Error Boundary component
 * Usage: <SentryErrorBoundary fallback={<ErrorFallback />}><App /></SentryErrorBoundary>
 */
export const SentryErrorBoundary = Sentry?.ErrorBoundary || (({ children }) => children);

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  SentryErrorBoundary,
};
