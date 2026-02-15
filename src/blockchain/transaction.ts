/**
 * Transaction management for the reversible transaction blockchain
 *
 * Handles transaction creation, state transitions, and validation
 */

import {
  Transaction,
  TransactionState,
  TransactionResult,
  CreateTransactionInput,
  Handshake,
  NetworkConfig,
  DEFAULT_CONFIG,
  type TransactionId,
  type PublicKey,
  type Hash,
  type Timestamp,
} from './types.js';
import {
  generateUUID,
  generateOneTimeKey,
  createHandshakeId,
  createAckId,
  hashObject,
  signObject,
} from '../crypto/index.js';

// ============================================================================
// Transaction Creation
// ============================================================================

/**
 * Create a new transaction in PENDING state
 */
export function createTransaction(
  input: CreateTransactionInput,
  privateKey: string,
  config: NetworkConfig = DEFAULT_CONFIG
): Transaction {
  const now = Date.now();

  // Validate grace period
  const gracePeriod = input.gracePeriod ?? config.defaultGracePeriod;
  if (gracePeriod < config.minGracePeriod || gracePeriod > config.maxGracePeriod) {
    throw new Error(
      `Grace period must be between ${config.minGracePeriod}ms and ${config.maxGracePeriod}ms`
    );
  }

  // Create handshake if requested
  let handshake: Handshake | null = null;
  if (input.useHandshake) {
    const oneTimeKey = generateOneTimeKey();
    handshake = {
      handshakeId: createHandshakeId(oneTimeKey),
      ackId: null,
      expiresAt: now + config.handshakeExpiry,
    };
  }

  // Build transaction without signature first
  const txData = {
    id: generateUUID(),
    sender: input.sender,
    recipient: input.recipient,
    amount: input.amount,
    memo: input.memo ?? '',
    state: TransactionState.PENDING,
    createdAt: now,
    expiresAt: now + gracePeriod,
    updatedAt: now,
    version: 1,
    handshake,
  };

  // Sign the transaction
  const signature = signObject(txData, privateKey);

  return {
    ...txData,
    signature,
  };
}

// ============================================================================
// State Transitions
// ============================================================================

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS: Record<TransactionState, TransactionState[]> = {
  [TransactionState.PENDING]: [
    TransactionState.FINALIZED,
    TransactionState.CANCELLED,
    TransactionState.FROZEN,
  ],
  [TransactionState.FROZEN]: [
    TransactionState.FINALIZED,
    TransactionState.RECOVERED,
  ],
  [TransactionState.FINALIZED]: [], // Terminal state
  [TransactionState.CANCELLED]: [], // Terminal state
  [TransactionState.RECOVERED]: [], // Terminal state
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: TransactionState, to: TransactionState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Transition a transaction to a new state
 */
function transitionState(
  tx: Transaction,
  newState: TransactionState,
  updates: Partial<Transaction> = {}
): TransactionResult {
  if (!isValidTransition(tx.state, newState)) {
    return {
      success: false,
      error: `Invalid state transition from ${tx.state} to ${newState}`,
    };
  }

  const now = Date.now();

  return {
    success: true,
    transaction: {
      ...tx,
      ...updates,
      state: newState,
      updatedAt: now,
      version: tx.version + 1,
    },
  };
}

// ============================================================================
// Transaction Operations
// ============================================================================

/**
 * Confirm a transaction (recipient acknowledges receipt)
 *
 * Transitions: PENDING -> FINALIZED
 */
export function confirmTransaction(
  tx: Transaction,
  recipientPublicKey: PublicKey,
  oneTimeKey?: string
): TransactionResult {
  // Validate recipient
  if (tx.recipient !== recipientPublicKey) {
    return {
      success: false,
      error: 'Only the recipient can confirm this transaction',
    };
  }

  // Check if already expired
  if (Date.now() > tx.expiresAt) {
    return {
      success: false,
      error: 'Transaction has expired',
    };
  }

  // Validate handshake if present
  if (tx.handshake) {
    if (!oneTimeKey) {
      return {
        success: false,
        error: 'One-time key required for handshake verification',
      };
    }

    const expectedHandshakeId = createHandshakeId(oneTimeKey);
    if (tx.handshake.handshakeId !== expectedHandshakeId) {
      return {
        success: false,
        error: 'Invalid one-time key',
      };
    }

    // Create acknowledgment
    const ackId = createAckId(oneTimeKey, recipientPublicKey);

    return transitionState(tx, TransactionState.FINALIZED, {
      handshake: {
        ...tx.handshake,
        ackId,
      },
    });
  }

  return transitionState(tx, TransactionState.FINALIZED);
}

/**
 * Cancel a transaction (sender requests cancellation)
 *
 * Transitions: PENDING -> CANCELLED
 */
export function cancelTransaction(
  tx: Transaction,
  senderPublicKey: PublicKey
): TransactionResult {
  // Validate sender
  if (tx.sender !== senderPublicKey) {
    return {
      success: false,
      error: 'Only the sender can cancel this transaction',
    };
  }

  // Check if still in PENDING state
  if (tx.state !== TransactionState.PENDING) {
    return {
      success: false,
      error: `Cannot cancel transaction in ${tx.state} state`,
    };
  }

  return transitionState(tx, TransactionState.CANCELLED);
}

/**
 * Freeze a transaction for guardian review
 *
 * Transitions: PENDING -> FROZEN
 */
export function freezeTransaction(
  tx: Transaction,
  reason: string
): TransactionResult {
  if (tx.state !== TransactionState.PENDING) {
    return {
      success: false,
      error: `Cannot freeze transaction in ${tx.state} state`,
    };
  }

  return transitionState(tx, TransactionState.FROZEN);
}

/**
 * Recover funds (guardian approves recovery to sender)
 *
 * Transitions: FROZEN -> RECOVERED
 */
export function recoverTransaction(tx: Transaction): TransactionResult {
  if (tx.state !== TransactionState.FROZEN) {
    return {
      success: false,
      error: `Cannot recover transaction in ${tx.state} state`,
    };
  }

  return transitionState(tx, TransactionState.RECOVERED);
}

/**
 * Approve a frozen transaction (guardian approves completion)
 *
 * Transitions: FROZEN -> FINALIZED
 */
export function approveFrozenTransaction(tx: Transaction): TransactionResult {
  if (tx.state !== TransactionState.FROZEN) {
    return {
      success: false,
      error: `Cannot approve transaction in ${tx.state} state`,
    };
  }

  return transitionState(tx, TransactionState.FINALIZED);
}

/**
 * Process expired transaction (auto-finalize or auto-return based on policy)
 *
 * This should be called periodically by the system
 */
export function processExpiredTransaction(
  tx: Transaction,
  autoFinalize: boolean = true
): TransactionResult {
  if (tx.state !== TransactionState.PENDING) {
    return {
      success: false,
      error: `Transaction is not in PENDING state`,
    };
  }

  if (Date.now() <= tx.expiresAt) {
    return {
      success: false,
      error: 'Transaction has not expired yet',
    };
  }

  // Auto-finalize or auto-return based on policy
  if (autoFinalize) {
    return transitionState(tx, TransactionState.FINALIZED);
  } else {
    return transitionState(tx, TransactionState.CANCELLED);
  }
}

// ============================================================================
// Transaction Validation
// ============================================================================

/**
 * Validate a transaction structure
 */
export function validateTransaction(tx: Transaction): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!tx.id) errors.push('Transaction ID is required');
  if (!tx.sender) errors.push('Sender is required');
  if (!tx.recipient) errors.push('Recipient is required');
  if (tx.amount <= 0n) errors.push('Amount must be positive');
  if (!tx.signature) errors.push('Signature is required');

  // Check sender != recipient
  if (tx.sender === tx.recipient) {
    errors.push('Sender and recipient cannot be the same');
  }

  // Check timestamps
  if (tx.expiresAt <= tx.createdAt) {
    errors.push('Expiry must be after creation time');
  }

  // Check version
  if (tx.version < 1) {
    errors.push('Version must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compute transaction hash (for inclusion in blocks)
 */
export function computeTransactionHash(tx: Transaction): Hash {
  // Exclude signature from hash to allow signature verification
  const { signature, ...txData } = tx;
  return hashObject(txData);
}

// ============================================================================
// Transaction Queries
// ============================================================================

/**
 * Check if a transaction is in a terminal state
 */
export function isTerminalState(state: TransactionState): boolean {
  return VALID_TRANSITIONS[state].length === 0;
}

/**
 * Check if a transaction is pending
 */
export function isPending(tx: Transaction): boolean {
  return tx.state === TransactionState.PENDING;
}

/**
 * Check if a transaction is finalized
 */
export function isFinalized(tx: Transaction): boolean {
  return tx.state === TransactionState.FINALIZED;
}

/**
 * Check if a transaction has expired
 */
export function isExpired(tx: Transaction): boolean {
  return Date.now() > tx.expiresAt && tx.state === TransactionState.PENDING;
}
