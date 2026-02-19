import { delay } from "./delay.ts";

interface RetryOptions {
  retries: number;
  delayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= options.retries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt <= options.retries) {
        options.onRetry?.(attempt, lastError);
        await delay(options.delayMs);
      }
    }
  }

  throw lastError;
}
