export interface ErrorStrategy {
  shouldRetry: boolean;
  waitTime: number;
}