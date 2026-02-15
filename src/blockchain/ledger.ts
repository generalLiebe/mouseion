/**
 * Ledger management for the reversible transaction blockchain
 *
 * Handles block creation, chain management, and account balances
 */

import {
  Transaction,
  TransactionState,
  Block,
  BlockHeader,
  Account,
  AccountBalance,
  type TransactionId,
  type PublicKey,
  type Hash,
  type Amount,
} from './types.js';
import {
  sha256,
  hashObject,
  computeMerkleRoot,
} from '../crypto/index.js';
import { computeTransactionHash, isTerminalState } from './transaction.js';

// ============================================================================
// Genesis Block
// ============================================================================

const GENESIS_HASH = '0'.repeat(64);

/**
 * Create the genesis block
 */
export function createGenesisBlock(): Block {
  const header: BlockHeader = {
    index: 0,
    timestamp: Date.now(),
    previousHash: GENESIS_HASH,
    merkleRoot: sha256(''),
    nonce: 0,
  };

  const hash = hashObject(header);

  return {
    header,
    transactions: [],
    hash,
  };
}

// ============================================================================
// Block Creation
// ============================================================================

/**
 * Create a new block with transactions
 */
export function createBlock(
  previousBlock: Block,
  transactions: Transaction[]
): Block {
  const transactionHashes = transactions.map(computeTransactionHash);
  const merkleRoot = computeMerkleRoot(transactionHashes);

  const header: BlockHeader = {
    index: previousBlock.header.index + 1,
    timestamp: Date.now(),
    previousHash: previousBlock.hash,
    merkleRoot,
    nonce: 0,
  };

  const hash = hashObject(header);

  return {
    header,
    transactions,
    hash,
  };
}

/**
 * Validate a block
 */
export function validateBlock(
  block: Block,
  previousBlock: Block
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check index
  if (block.header.index !== previousBlock.header.index + 1) {
    errors.push('Invalid block index');
  }

  // Check previous hash
  if (block.header.previousHash !== previousBlock.hash) {
    errors.push('Invalid previous hash');
  }

  // Check timestamp (allow equal timestamps for same-millisecond blocks)
  if (block.header.timestamp < previousBlock.header.timestamp) {
    errors.push('Block timestamp must not be before previous block');
  }

  // Verify merkle root
  const transactionHashes = block.transactions.map(computeTransactionHash);
  const expectedMerkleRoot = computeMerkleRoot(transactionHashes);
  if (block.header.merkleRoot !== expectedMerkleRoot) {
    errors.push('Invalid merkle root');
  }

  // Verify block hash
  const expectedHash = hashObject(block.header);
  if (block.hash !== expectedHash) {
    errors.push('Invalid block hash');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Ledger State
// ============================================================================

/**
 * In-memory ledger state
 */
export interface LedgerState {
  /** All blocks in the chain */
  blocks: Block[];

  /** Account states indexed by public key */
  accounts: Map<PublicKey, Account>;

  /** Pending transactions (not yet in a block) */
  pendingTransactions: Map<TransactionId, Transaction>;

  /** All transactions indexed by ID */
  transactionIndex: Map<TransactionId, Transaction>;
}

/**
 * Create initial ledger state
 */
export function createLedgerState(): LedgerState {
  const genesisBlock = createGenesisBlock();

  return {
    blocks: [genesisBlock],
    accounts: new Map(),
    pendingTransactions: new Map(),
    transactionIndex: new Map(),
  };
}

// ============================================================================
// Account Management
// ============================================================================

/**
 * Get or create an account
 */
export function getOrCreateAccount(
  state: LedgerState,
  publicKey: PublicKey
): Account {
  let account = state.accounts.get(publicKey);

  if (!account) {
    account = {
      publicKey,
      balance: {
        available: 0n,
        pendingOutgoing: 0n,
        pendingIncoming: 0n,
        total: 0n,
      },
      transactionCount: 0,
      lastActivity: Date.now(),
    };
    state.accounts.set(publicKey, account);
  }

  return account;
}

/**
 * Update account balance
 */
function updateAccountBalance(account: Account): void {
  account.balance.total = account.balance.available + account.balance.pendingIncoming;
}

/**
 * Credit an account (add funds)
 */
export function creditAccount(
  state: LedgerState,
  publicKey: PublicKey,
  amount: Amount,
  pending: boolean = false
): void {
  const account = getOrCreateAccount(state, publicKey);

  if (pending) {
    account.balance.pendingIncoming += amount;
  } else {
    account.balance.available += amount;
  }

  updateAccountBalance(account);
  account.lastActivity = Date.now();
}

/**
 * Debit an account (remove funds)
 */
export function debitAccount(
  state: LedgerState,
  publicKey: PublicKey,
  amount: Amount,
  pending: boolean = false
): boolean {
  const account = getOrCreateAccount(state, publicKey);

  if (pending) {
    if (account.balance.available < amount) {
      return false;
    }
    account.balance.available -= amount;
    account.balance.pendingOutgoing += amount;
  } else {
    if (account.balance.available < amount) {
      return false;
    }
    account.balance.available -= amount;
  }

  updateAccountBalance(account);
  account.lastActivity = Date.now();
  return true;
}

/**
 * Mint new tokens to an account (for initial distribution/rewards)
 */
export function mintTokens(
  state: LedgerState,
  publicKey: PublicKey,
  amount: Amount
): void {
  creditAccount(state, publicKey, amount, false);
}

// ============================================================================
// Transaction Processing
// ============================================================================

/**
 * Add a pending transaction to the ledger
 */
export function addPendingTransaction(
  state: LedgerState,
  tx: Transaction
): { success: boolean; error?: string } {
  // Check if transaction already exists
  if (state.transactionIndex.has(tx.id)) {
    return { success: false, error: 'Transaction already exists' };
  }

  // Check sender has sufficient balance
  const sender = getOrCreateAccount(state, tx.sender);
  if (sender.balance.available < tx.amount) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Debit sender (move to pending outgoing)
  debitAccount(state, tx.sender, tx.amount, true);

  // Credit recipient as pending
  creditAccount(state, tx.recipient, tx.amount, true);

  // Store transaction
  state.pendingTransactions.set(tx.id, tx);
  state.transactionIndex.set(tx.id, tx);

  // Update sender transaction count
  sender.transactionCount++;

  return { success: true };
}

/**
 * Process a transaction state change
 */
export function processTransactionStateChange(
  state: LedgerState,
  tx: Transaction,
  newTx: Transaction
): void {
  const oldState = tx.state;
  const newState = newTx.state;

  // Handle balance updates based on state transition
  if (oldState === TransactionState.PENDING) {
    if (newState === TransactionState.FINALIZED) {
      // Move from pending to confirmed
      const sender = getOrCreateAccount(state, tx.sender);
      sender.balance.pendingOutgoing -= tx.amount;

      const recipient = getOrCreateAccount(state, tx.recipient);
      recipient.balance.pendingIncoming -= tx.amount;
      recipient.balance.available += tx.amount;
      updateAccountBalance(recipient);
    } else if (newState === TransactionState.CANCELLED) {
      // Return funds to sender
      const sender = getOrCreateAccount(state, tx.sender);
      sender.balance.pendingOutgoing -= tx.amount;
      sender.balance.available += tx.amount;
      updateAccountBalance(sender);

      const recipient = getOrCreateAccount(state, tx.recipient);
      recipient.balance.pendingIncoming -= tx.amount;
      updateAccountBalance(recipient);
    } else if (newState === TransactionState.FROZEN) {
      // Funds remain locked, no balance change
    }
  } else if (oldState === TransactionState.FROZEN) {
    if (newState === TransactionState.FINALIZED) {
      // Complete the frozen transaction
      const sender = getOrCreateAccount(state, tx.sender);
      sender.balance.pendingOutgoing -= tx.amount;

      const recipient = getOrCreateAccount(state, tx.recipient);
      recipient.balance.pendingIncoming -= tx.amount;
      recipient.balance.available += tx.amount;
      updateAccountBalance(recipient);
    } else if (newState === TransactionState.RECOVERED) {
      // Return funds to sender
      const sender = getOrCreateAccount(state, tx.sender);
      sender.balance.pendingOutgoing -= tx.amount;
      sender.balance.available += tx.amount;
      updateAccountBalance(sender);

      const recipient = getOrCreateAccount(state, tx.recipient);
      recipient.balance.pendingIncoming -= tx.amount;
      updateAccountBalance(recipient);
    }
  }

  // Update transaction in index
  state.transactionIndex.set(newTx.id, newTx);

  // Remove from pending if terminal
  if (isTerminalState(newState)) {
    state.pendingTransactions.delete(newTx.id);
  }
}

// ============================================================================
// Block Processing
// ============================================================================

/**
 * Add a block to the chain
 */
export function addBlock(
  state: LedgerState,
  transactions: Transaction[]
): { success: boolean; block?: Block; error?: string } {
  const lastBlock = state.blocks[state.blocks.length - 1];

  // Create new block
  const block = createBlock(lastBlock, transactions);

  // Validate block
  const validation = validateBlock(block, lastBlock);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }

  // Add to chain
  state.blocks.push(block);

  // Index transactions
  for (const tx of transactions) {
    state.transactionIndex.set(tx.id, tx);
    state.pendingTransactions.delete(tx.id);
  }

  return { success: true, block };
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get current block height
 */
export function getBlockHeight(state: LedgerState): number {
  return state.blocks.length - 1; // Genesis is 0
}

/**
 * Get a block by index
 */
export function getBlockByIndex(state: LedgerState, index: number): Block | undefined {
  return state.blocks[index];
}

/**
 * Get a block by hash
 */
export function getBlockByHash(state: LedgerState, hash: Hash): Block | undefined {
  return state.blocks.find((b) => b.hash === hash);
}

/**
 * Get a transaction by ID
 */
export function getTransaction(
  state: LedgerState,
  txId: TransactionId
): Transaction | undefined {
  return state.transactionIndex.get(txId);
}

/**
 * Get account balance
 */
export function getAccountBalance(
  state: LedgerState,
  publicKey: PublicKey
): AccountBalance {
  const account = state.accounts.get(publicKey);

  if (!account) {
    return {
      available: 0n,
      pendingOutgoing: 0n,
      pendingIncoming: 0n,
      total: 0n,
    };
  }

  return { ...account.balance };
}

/**
 * Get pending transactions for an account
 */
export function getAccountPendingTransactions(
  state: LedgerState,
  publicKey: PublicKey
): Transaction[] {
  const transactions: Transaction[] = [];

  for (const tx of state.pendingTransactions.values()) {
    if (tx.sender === publicKey || tx.recipient === publicKey) {
      transactions.push(tx);
    }
  }

  return transactions;
}

/**
 * Get all transactions for an account
 */
export function getAccountTransactions(
  state: LedgerState,
  publicKey: PublicKey
): Transaction[] {
  const transactions: Transaction[] = [];

  for (const tx of state.transactionIndex.values()) {
    if (tx.sender === publicKey || tx.recipient === publicKey) {
      transactions.push(tx);
    }
  }

  return transactions.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get expired pending transactions
 */
export function getExpiredTransactions(state: LedgerState): Transaction[] {
  const now = Date.now();
  const expired: Transaction[] = [];

  for (const tx of state.pendingTransactions.values()) {
    if (tx.state === TransactionState.PENDING && now > tx.expiresAt) {
      expired.push(tx);
    }
  }

  return expired;
}
