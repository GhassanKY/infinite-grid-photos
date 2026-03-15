'use server'
import api from "../services/axios";
import { getRetryDelay } from "../lib/api-utils";
import { HTTP_STATUS, RETRY_CONFIG, APP_CONFIG } from "../constants/api";
import axios from "axios";
import { Photo } from "../interface/photo.interface";
import { ErrorStrategy } from "../interface/api.interface";

export const getPhotos = async (page: number, retries: number = RETRY_CONFIG.MAX_RETRIES): Promise<Photo[]> => {
  try {
    const { data } = await api.get<Photo[]>('/v2/list', {
      params: { page, limit: APP_CONFIG.DEFAULT_PAGE_SIZE }
    });

    if (!Array.isArray(data)) {
      throw new Error(`Invalid schema on page ${page}`);
    }

    return data;

  } catch (error: unknown) {
    const strategy = processApiError(error, retries);
    if (!strategy.shouldRetry) return [];
    await new Promise((res) => setTimeout(res, strategy.waitTime));
    const nextRetryAttempt = retries - RETRY_CONFIG.RETRY_STEP;
    return getPhotos(page, nextRetryAttempt);
  }
}


/**
 * Processes API errors and determines the next action.
 * Centralizes logging and retry logic to keep Server Actions clean.
 */
const processApiError = (error: unknown, retries: number): ErrorStrategy => {

  if (!axios.isAxiosError(error)) {
    console.error(`[Unexpected Error]: ${error instanceof Error ? error.message : "Unknown"}`);
    return { shouldRetry: false, waitTime: 0 };
  }

  const { response, message: axiosMessage } = error;
  const isRateLimit = response?.status === HTTP_STATUS.TOO_MANY_REQUESTS;
  const hasRetries = retries > 0;

  if (!isRateLimit || !hasRetries) {
    const apiErrorMessage = response?.data?.error || axiosMessage;
    console.error(`[API Error] Status: ${response?.status || 'Network'}. Message: ${apiErrorMessage}`);
    return { shouldRetry: false, waitTime: 0 };
  }

  const retryAfter = response?.headers['retry-after'];
  const waitTime = getRetryDelay(retries, retryAfter);

  console.warn(`[429] Rate limit reached. Retrying in ${Math.round(waitTime)}ms...`);

  return { shouldRetry: true, waitTime };
};
