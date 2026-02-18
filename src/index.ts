/**
 * Mouseion - Reversible Transaction Blockchain
 *
 * A blockchain system designed for fair value distribution
 * with support for reversible transactions and AI royalty distribution.
 */

// Core blockchain types
export {
  TransactionState,
  GuardianDecision,
  EventType,
  DEFAULT_CONFIG,
  type TransactionId,
  type PublicKey,
  type Signature,
  type Hash,
  type Amount,
  type Timestamp,
  type Transaction,
  type Handshake,
  type CreateTransactionInput,
  type TransactionResult,
  type Block,
  type BlockHeader,
  type Account,
  type AccountBalance,
  type GuardianVote,
  type NetworkConfig,
  type BlockchainEvent,
} from './blockchain/types.js';

// Cryptographic utilities
export {
  sha256,
  hashObject,
  computeMerkleRoot,
  generateRandomBytes,
  generateRandomHex,
  generateUUID,
  generateOneTimeKey,
  generateKeyPair,
  sign,
  signObject,
  verify,
  verifyObject,
  createHandshakeId,
  createAckId,
  verifyHandshake,
  encryptPrivateKey,
  decryptPrivateKey,
  isEncryptedKey,
  type KeyPair,
  type EncryptedKey,
} from './crypto/index.js';

// Contacts / Address Book
export {
  type Contact,
  isValidAddress,
} from './contacts/index.js';

// Transaction management
export {
  createTransaction,
  confirmTransaction,
  cancelTransaction,
  freezeTransaction,
  recoverTransaction,
  approveFrozenTransaction,
  processExpiredTransaction,
  validateTransaction,
  computeTransactionHash,
  isValidTransition,
  isTerminalState,
  isPending,
  isFinalized,
  isExpired,
} from './blockchain/transaction.js';

// Ledger management
export {
  createGenesisBlock,
  createBlock,
  validateBlock,
  createLedgerState,
  getOrCreateAccount,
  creditAccount,
  debitAccount,
  mintTokens,
  addPendingTransaction,
  processTransactionStateChange,
  addBlock,
  getBlockHeight,
  getBlockByIndex,
  getBlockByHash,
  getTransaction,
  getAccountBalance,
  getAccountPendingTransactions,
  getAccountTransactions,
  getExpiredTransactions,
  type LedgerState,
} from './blockchain/ledger.js';

// Wallet
export {
  createWallet,
  importWallet,
  getAddress,
  getBalance,
  hasSufficientBalance,
  send,
  confirmReceived,
  cancelSent,
  getPendingTransactions,
  getTransactionHistory,
  getSentTransactions,
  getReceivedTransactions,
  exportWallet,
  importWalletFromExport,
  type Wallet,
  type TransactionHistoryEntry,
  type WalletExport,
} from './wallet/wallet.js';

// CLI state management (shared with Web GUI)
export { StateManager, type CLIState } from './cli/state.js';
