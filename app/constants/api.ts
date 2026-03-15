/**
 * API HTTP Status Codes
 */
export const HTTP_STATUS = {
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Network Retry & Backoff Configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_STEP: 1,
  JITTER_MAX_MS: 500,
} as const;

/**
 * UI & Application Logic Thresholds
 */
export const APP_CONFIG = {
  MIN_ITEMS_THRESHOLD: 20,
  DEFAULT_PAGE_SIZE: 20,
} as const;

/**
 * Time Unit Conversions
 */
export const TIME = {
  SECONDS_TO_MS: 1000,
  INCREMENT_MS: 200,
  MIN_REQUEST_DELAY_MS: 1000,
  MAX_REQUEST_DELAY_MS: 4000,
} as const;