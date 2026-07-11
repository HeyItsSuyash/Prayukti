import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_KEY = 'request_timeout_ms';

/**
 * Override the default request timeout for a specific handler or controller.
 * @param ms Timeout in milliseconds
 *
 * @example
 * \@Timeout(60_000) // 60 seconds for long-running AI jobs
 * async analyzeCode() {}
 */
export const Timeout = (ms: number): ReturnType<typeof SetMetadata> =>
  SetMetadata(TIMEOUT_KEY, ms);
