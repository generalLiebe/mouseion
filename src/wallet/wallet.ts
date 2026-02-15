/**
 * Wallet management for the Mouseion blockchain
 *
 * Provides user-facing functionality for key management and transactions
 */

import {
  Transaction,
  TransactionResult,
  CreateTransactionInput,
  AccountBalance,
  NetworkConfig,
  DEFAULT_CONFIG,
  type PublicKey,
  type TransactionId,
} from '../blockchain/types.js';
import { generateKeyPair, type KeyPair } from '../crypto/index.js';
import {
  createTransaction,
  confirmTransaction,
  cancelTransaction,
} from '../blockchain/transaction.js';
import {
  LedgerState,
  addPendingTransaction,
  processTransactionStateChange,
  getAccountBalance,
  getAccountPendingTransactions,
  getAccountTransactions,
  getTransaction,
} from '../blockchain/ledger.js';

// ============================================================================
// Wallet Types
// ============================================================================

/**
 * Wallet state
 */
export interface Wallet {
  /** Key pair for signing */
  keyPair: KeyPair;

  /** Display name (optional) */
  name?: string;

  /** Creation timestamp */
  createdAt: number;
}

/**
 * Transaction history entry
 */
export interface TransactionHistoryEntry {
  transaction: Transaction;
  direction: 'sent' | 'received';
  counterparty: PublicKey;
}

// ============================================================================
// Wallet Creation
// ============================================================================

/**
 * Create a new wallet with a fresh key pair
 */
export function createWallet(name?: string): Wallet {
  return {
    keyPair: generateKeyPair(),
    name,
    createdAt: Date.now(),
  };
}

/**
 * Import a wallet from an existing key pair
 */
export function importWallet(keyPair: KeyPair, name?: string): Wallet {
  return {
    keyPair,
    name,
    createdAt: Date.now(),
  };
}

/**
 * Get the wallet's public key (address)
 */
export function getAddress(wallet: Wallet): PublicKey {
  return wallet.keyPair.publicKey;
}

// ============================================================================
// Balance Queries
// ============================================================================

/**
 * Get the wallet's balance from the ledger
 */
export function getBalance(wallet: Wallet, ledger: LedgerState): AccountBalance {
  return getAccountBalance(ledger, wallet.keyPair.publicKey);
}

/**
 * Check if the wallet has sufficient balance for an amount
 */
export function hasSufficientBalance(
  wallet: Wallet,
  ledger: LedgerState,
  amount: bigint
): boolean {
  const balance = getBalance(wallet, ledger);
  return balance.available >= amount;
}

// ============================================================================
// Transaction Operations
// ============================================================================

/**
 * Send funds to a recipient
 */
export function send(
  wallet: Wallet,
  ledger: LedgerState,
  recipient: PublicKey,
  amount: bigint,
  options: {
    memo?: string;
    gracePeriod?: number;
    useHandshake?: boolean;
  } = {},
  config: NetworkConfig = DEFAULT_CONFIG
): { success: boolean; transaction?: Transaction; oneTimeKey?: string; error?: string } {
  // Check balance
  if (!hasSufficientBalance(wallet, ledger, amount)) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Create transaction input
  const input: CreateTransactionInput = {
    sender: wallet.keyPair.publicKey,
    recipient,
    amount,
    memo: options.memo,
    gracePeriod: options.gracePeriod,
    useHandshake: options.useHandshake,
  };

  // Create and sign transaction
  const tx = createTransaction(input, wallet.keyPair.privateKey, config);

  // Add to ledger
  const result = addPendingTransaction(ledger, tx);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // If using handshake, we need to communicate the one-time key out of band
  // For now, we include it in the response (in practice, this would be sent separately)
  let oneTimeKey: string | undefined;
  if (options.useHandshake && tx.handshake) {
    // Note: In a real implementation, the one-time key would be stored
    // separately and communicated to the recipient through a secure channel
    oneTimeKey = undefined; // The actual key is not stored after creation
  }

  return { success: true, transaction: tx, oneTimeKey };
}

/**
 * Confirm a received transaction (as recipient)
 */
export function confirmReceived(
  wallet: Wallet,
  ledger: LedgerState,
  txId: TransactionId,
  oneTimeKey?: string
): TransactionResult {
  const tx = getTransaction(ledger, txId);

  if (!tx) {
    return { success: false, error: 'Transaction not found' };
  }

  const result = confirmTransaction(tx, wallet.keyPair.publicKey, oneTimeKey);

  if (result.success && result.transaction) {
    processTransactionStateChange(ledger, tx, result.transaction);
  }

  return result;
}

/**
 * Cancel a sent transaction (as sender)
 */
export function cancelSent(
  wallet: Wallet,
  ledger: LedgerState,
  txId: TransactionId
): TransactionResult {
  const tx = getTransaction(ledger, txId);

  if (!tx) {
    return { success: false, error: 'Transaction not found' };
  }

  const result = cancelTransaction(tx, wallet.keyPair.publicKey);

  if (result.success && result.transaction) {
    processTransactionStateChange(ledger, tx, result.transaction);
  }

  return result;
}

// ============================================================================
// Transaction History
// ============================================================================

/**
 * Get pending transactions (both sent and received)
 */
export function getPendingTransactions(
  wallet: Wallet,
  ledger: LedgerState
): TransactionHistoryEntry[] {
  const transactions = getAccountPendingTransactions(ledger, wallet.keyPair.publicKey);

  return transactions.map((tx) => ({
    transaction: tx,
    direction: tx.sender === wallet.keyPair.publicKey ? 'sent' : 'received',
    counterparty:
      tx.sender === wallet.keyPair.publicKey ? tx.recipient : tx.sender,
  }));
}

/**
 * Get all transaction history
 */
export function getTransactionHistory(
  wallet: Wallet,
  ledger: LedgerState
): TransactionHistoryEntry[] {
  const transactions = getAccountTransactions(ledger, wallet.keyPair.publicKey);

  return transactions.map((tx) => ({
    transaction: tx,
    direction: tx.sender === wallet.keyPair.publicKey ? 'sent' : 'received',
    counterparty:
      tx.sender === wallet.keyPair.publicKey ? tx.recipient : tx.sender,
  }));
}

/**
 * Get sent transactions
 */
export function getSentTransactions(
  wallet: Wallet,
  ledger: LedgerState
): Transaction[] {
  const transactions = getAccountTransactions(ledger, wallet.keyPair.publicKey);
  return transactions.filter((tx) => tx.sender === wallet.keyPair.publicKey);
}

/**
 * Get received transactions
 */
export function getReceivedTransactions(
  wallet: Wallet,
  ledger: LedgerState
): Transaction[] {
  const transactions = getAccountTransactions(ledger, wallet.keyPair.publicKey);
  return transactions.filter((tx) => tx.recipient === wallet.keyPair.publicKey);
}

// ============================================================================
// Wallet Serialization
// ============================================================================

/**
 * Wallet export format (for backup)
 */
export interface WalletExport {
  version: number;
  name?: string;
  publicKey: string;
  privateKey: string;
  createdAt: number;
}

/**
 * Export wallet for backup (CAUTION: includes private key)
 */
export function exportWallet(wallet: Wallet): WalletExport {
  return {
    version: 1,
    name: wallet.name,
    publicKey: wallet.keyPair.publicKey,
    privateKey: wallet.keyPair.privateKey,
    createdAt: wallet.createdAt,
  };
}

/**
 * Import wallet from backup
 */
export function importWalletFromExport(data: WalletExport): Wallet {
  if (data.version !== 1) {
    throw new Error(`Unsupported wallet export version: ${data.version}`);
  }

  return {
    keyPair: {
      publicKey: data.publicKey,
      privateKey: data.privateKey,
    },
    name: data.name,
    createdAt: data.createdAt,
  };
}
