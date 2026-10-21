// Shared helpers that simulate network behaviour for the async mock services.

export const MOCK_NETWORK_DELAY_MS = 250

/** Resolves after a simulated network delay. */
export function delay<T>(value: T, ms: number = MOCK_NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** Error thrown by the mock services when a request cannot be fulfilled. */
export class MockServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MockServiceError'
  }
}
