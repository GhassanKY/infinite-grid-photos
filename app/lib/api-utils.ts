import { RETRY_CONFIG, TIME } from "../constants/api";

/**
 * Calculates the wait time (in ms) before performing a retry.
 * If the server provides a 'retry-after' header, it respects that value.
 * Otherwise, it applies an exponential backoff ($2^{4 - \text{retries}}$)
 * plus a random 'jitter' to prevent simultaneous request collisions.
 */
export const getRetryDelay = (retries: number, retryAfterHeader?: string): number => {
  const exponent = RETRY_CONFIG.MAX_RETRIES - retries + RETRY_CONFIG.RETRY_STEP;
  
  const delayInSeconds = retryAfterHeader 
    ? parseInt(retryAfterHeader, 10) 
    : Math.pow(2, exponent);
    
  const jitter = Math.random() * RETRY_CONFIG.JITTER_MAX_MS;
  
  return (delayInSeconds * TIME.SECONDS_TO_MS) + jitter;
};

