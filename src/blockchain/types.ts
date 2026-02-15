/**
 * Core type definitions for the Mouseion reversible transaction blockchain
 */

// ============================================================================
// Basic Types
// ============================================================================

/** Unique identifier (UUID v4 format) */
export type TransactionId = string;

/** Public key in hex format */
export type PublicKey = string;

/** Signature in hex format */
export type Signature = string;

/** Hash in hex format (SHA-256) */
export type Hash = string;

/** Amount in smallest unit (similar to wei/satoshi) */
export type Amount = bigint;

/** Unix timestamp in milliseconds */
export type Timestamp = number;

// ============================================================================
// Transaction States
// ============================================================================

/**
 * Transaction state in the reversible transaction model
 *
 * State transitions:
 *   PENDING -> FINALIZED (recipient confirms or timeout)
 *   PENDING -> CANCELLED (sender cancels before confirmation)
 *   PENDING -> FROZEN (flagged for review)
 *   FROZEN -> RECOVERED (guardian approves recovery)
 *   FROZEN -> FINALIZED (guardian approves completion)
 */
export enum TransactionState {
  /** Transaction created but not yet confirmed by recipient */
  PENDING = 'PENDING',

  /** Transaction completed successfully */
  FINALIZED = 'FINALIZED',

  /** Transaction cancelled by sender before confirmation */
  CANCELLED = 'CANCELLED',

  /** Transaction frozen for guardian review */
  FROZEN = 'FROZEN',

  /** Funds recovered after guardian approval */
  RECOVERED = 'RECOVERED',
}

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * Handshake data for one-time key verification
 */
export interface Handshake {
  /** Hash of the one-time key (passphrase) */
  handshakeId: Hash;

  /** Hash of recipient's acknowledgment (null until received) */
  ackId: Hash | null;

  /** Expiry timestamp for the handshake */
  expiresAt: Timestamp;
}

/**
 * Core transaction structure
 */
export interface Transaction {
  /** Unique transaction identifier */
  id: TransactionId;

  /** Sender's public key */
  sender: PublicKey;

  /** Recipient's public key */
  recipient: PublicKey;

  /** Transfer amount */
  amount: Amount;

  /** Optional memo/purpose */
  memo: string;

  /** Current transaction state */
  state: TransactionState;

  /** Creation timestamp */
  createdAt: Timestamp;

  /** Expiry timestamp (for auto-finalization or auto-return) */
  expiresAt: Timestamp;

  /** Last state change timestamp */
  updatedAt: Timestamp;

  /** Version number for optimistic locking */
  version: number;

  /** Handshake data (optional, for one-time key verification) */
  handshake: Handshake | null;

  /** Sender's signature */
  signature: Signature;
}

/**
 * Input for creating a new transaction
 */
export interface CreateTransactionInput {
  sender: PublicKey;
  recipient: PublicKey;
  amount: Amount;
  memo?: string;
  /** Grace period in milliseconds (default: 1 hour) */
  gracePeriod?: number;
  /** Whether to use handshake verification */
  useHandshake?: boolean;
}

/**
 * Result of a transaction state change
 */
export interface TransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

// ============================================================================
// Block Types
// ============================================================================

/**
 * Block header containing metadata
 */
export interface BlockHeader {
  /** Block index (height) */
  index: number;

  /** Block timestamp */
  timestamp: Timestamp;

  /** Hash of the previous block */
  previousHash: Hash;

  /** Merkle root of transactions */
  merkleRoot: Hash;

  /** Nonce for proof of work (placeholder for future consensus) */
  nonce: number;
}

/**
 * Complete block structure
 */
export interface Block {
  /** Block header */
  header: BlockHeader;

  /** Transactions included in this block */
  transactions: Transaction[];

  /** Block hash */
  hash: Hash;
}

// ============================================================================
// Account Types
// ============================================================================

/**
 * Account balance information
 */
export interface AccountBalance {
  /** Available balance (can be spent) */
  available: Amount;

  /** Pending outgoing (locked in pending transactions) */
  pendingOutgoing: Amount;

  /** Pending incoming (waiting to be confirmed) */
  pendingIncoming: Amount;

  /** Total balance (available + pendingIncoming) */
  total: Amount;
}

/**
 * Account state
 */
export interface Account {
  /** Account public key */
  publicKey: PublicKey;

  /** Balance information */
  balance: AccountBalance;

  /** Transaction count (for nonce) */
  transactionCount: number;

  /** Last activity timestamp */
  lastActivity: Timestamp;
}

// ============================================================================
// Guardian Types
// ============================================================================

/**
 * Guardian decision on a frozen transaction
 */
export enum GuardianDecision {
  /** Approve the transaction to complete */
  APPROVE = 'APPROVE',

  /** Recover funds to sender */
  RECOVER = 'RECOVER',

  /** Need more information */
  PENDING_REVIEW = 'PENDING_REVIEW',
}

/**
 * Guardian vote on a dispute
 */
export interface GuardianVote {
  /** Guardian's public key */
  guardian: PublicKey;

  /** Decision */
  decision: GuardianDecision;

  /** Reason for the decision */
  reason: string;

  /** Vote timestamp */
  timestamp: Timestamp;

  /** Signature */
  signature: Signature;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Network configuration parameters
 */
export interface NetworkConfig {
  /** Minimum grace period in milliseconds */
  minGracePeriod: number;

  /** Maximum grace period in milliseconds */
  maxGracePeriod: number;

  /** Default grace period in milliseconds */
  defaultGracePeriod: number;

  /** Handshake expiry in milliseconds */
  handshakeExpiry: number;

  /** Base transaction fee */
  baseFee: Amount;

  /** Cancellation fee (percentage of amount, in basis points) */
  cancellationFeeBps: number;

  /** Maximum cancellations per hour per account */
  maxCancellationsPerHour: number;

  /** Required guardian votes for dispute resolution */
  requiredGuardianVotes: number;
}

/**
 * Default network configuration
 */
export const DEFAULT_CONFIG: NetworkConfig = {
  minGracePeriod: 3 * 60 * 1000,        // 3 minutes
  maxGracePeriod: 24 * 60 * 60 * 1000,  // 24 hours
  defaultGracePeriod: 60 * 60 * 1000,   // 1 hour
  handshakeExpiry: 5 * 60 * 1000,       // 5 minutes
  baseFee: 1000n,                        // Base fee in smallest unit
  cancellationFeeBps: 50,                // 0.5%
  maxCancellationsPerHour: 10,
  requiredGuardianVotes: 3,
};

// ============================================================================
// Event Types
// ============================================================================

/**
 * Event types emitted by the blockchain
 */
export enum EventType {
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_CONFIRMED = 'TRANSACTION_CONFIRMED',
  TRANSACTION_CANCELLED = 'TRANSACTION_CANCELLED',
  TRANSACTION_FROZEN = 'TRANSACTION_FROZEN',
  TRANSACTION_RECOVERED = 'TRANSACTION_RECOVERED',
  TRANSACTION_EXPIRED = 'TRANSACTION_EXPIRED',
  BLOCK_CREATED = 'BLOCK_CREATED',
  HANDSHAKE_COMPLETED = 'HANDSHAKE_COMPLETED',
}

/**
 * Blockchain event
 */
export interface BlockchainEvent {
  type: EventType;
  timestamp: Timestamp;
  data: Transaction | Block;
}
