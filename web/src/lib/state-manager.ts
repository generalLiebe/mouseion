/**
 * StateManager wrapper for API routes
 * Provides singleton access to the shared CLI state
 */
import { StateManager, type CLIState } from "mouseion";

let manager: StateManager | null = null;

function getManager(): StateManager {
  if (!manager) {
    manager = new StateManager();
  }
  return manager;
}

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
