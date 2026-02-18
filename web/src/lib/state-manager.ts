/**
 * StateManager wrapper for API routes
 * Provides singleton access to the shared CLI state
 */
import { StateManager, type CLIState } from "mouseion";
import type { Contact } from "mouseion";

let manager: StateManager | null = null;

function getManager(): StateManager {
  if (!manager) {
    manager = new StateManager();
  }
  return manager;
}

/**
 * Load state without decrypting private keys (no password needed)
 * Safe for read-only operations: balance, status, transaction history
 */
export function loadStatePublicOnly(): CLIState {
  return getManager().loadPublicOnly();
}

/**
 * Load state with password for signing operations
 */
export function loadStateWithPassword(password: string): CLIState {
  const mgr = getManager();
  mgr.setPassword(password);
  return mgr.load();
}

/**
 * Save state with password (re-encrypts private keys)
 */
export function saveStateWithPassword(state: CLIState, password: string): void {
  const mgr = getManager();
  mgr.setPassword(password);
  mgr.save(state);
}

/**
 * Check if the state is encrypted
 */
export function isEncrypted(): boolean {
  return getManager().isStateEncrypted();
}

/**
 * Save contacts only (no password needed, does not touch private keys)
 */
export function saveContactsOnly(contacts: Contact[]): void {
  getManager().saveContactsOnly(contacts);
}

// Keep backwards-compatible exports
export function loadState(): CLIState {
  return getManager().load();
}

export function saveState(state: CLIState): void {
  getManager().save(state);
}

/**
 * Serialize BigInt values in an object to strings for JSON response
 */
export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}
