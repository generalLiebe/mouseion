/**
 * Contact validation utilities
 */

/**
 * Validate that a string is a valid wallet address (64 hex chars, SHA-256 hash)
 */
export function isValidAddress(address: string): boolean {
  return /^[0-9a-f]{64}$/i.test(address);
}
