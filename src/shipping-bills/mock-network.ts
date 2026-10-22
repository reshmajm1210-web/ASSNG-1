/**
 * Shared "fake network" helpers for every mock service in the app.
 *
 * Why this file exists:
 * The app has no backend. To keep the UI code realistic (loading states, error
 * handling, retries) the services return Promises that resolve after a short
 * delay, exactly like a real HTTP client would.
 *
 * Keeping the delay + error type in one place means every service behaves the
 * same way, and a real API client can later replace these helpers without the
 * UI noticing.
 */

/** Typical round-trip time used for list/get/save calls. */
export const MOCK_LATENCY_MS = 250

/** Faster round-trip time used for "look up one record" calls. */
export const LOOKUP_LATENCY_MS = 100

/** Error shape thrown by the mock services. Mirrors an HTTP failure. */
export class MockServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MockServiceError'
  }
}

/**
 * Resolve `value` after `ms` milliseconds.
 *
 * Returned as a real Promise (instead of `Promise.resolve`) so that the UI
 * exercises its loading paths in development.
 */
export function mockDelay<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, ms)
  })
}

/**
 * Reject with a {@link MockServiceError} after `ms` milliseconds.
 * Used for "record not found" and simulated write failures.
 */
export async function mockFailure(message: string, ms: number = MOCK_LATENCY_MS): Promise<never> {
  await mockDelay(null, ms)
  throw new MockServiceError(message)
}
