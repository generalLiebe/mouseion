/**
 * Tests for ledger management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createLedgerState,
  createGenesisBlock,
  createBlock,
  validateBlock,
  getOrCreateAccount,
  creditAccount,
  debitAccount,
  mintTokens,
  addPendingTransaction,
  processTransactionStateChange,
  addBlock,
  getBlockHeight,
  getBlockByIndex,
  getTransaction,
  getAccountBalance,
  getAccountPendingTransactions,
  getExpiredTransactions,
  type LedgerState,
} from '../src/blockchain/ledger.js';
import { createTransaction, confirmTransaction } from '../src/blockchain/transaction.js';
import { TransactionState } from '../src/blockchain/types.js';
import { generateKeyPair } from '../src/crypto/index.js';

describe('Genesis Block', () => {
  it('should create a valid genesis block', () => {
    const genesis = createGenesisBlock();

    expect(genesis.header.index).toBe(0);
    expect(genesis.header.previousHash).toBe('0'.repeat(64));
    expect(genesis.transactions).toHaveLength(0);
    expect(genesis.hash).toBeDefined();
  });
});

describe('Block Creation', () => {
  it('should create a new block with transactions', () => {
    const genesis = createGenesisBlock();
    const sender = generateKeyPair();
    const recipient = generateKeyPair();

    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
      },
      sender.privateKey
    );

    const block = createBlock(genesis, [tx]);

    expect(block.header.index).toBe(1);
    expect(block.header.previousHash).toBe(genesis.hash);
    expect(block.transactions).toHaveLength(1);
    expect(block.transactions[0].id).toBe(tx.id);
  });

  it('should validate a correct block', () => {
    const genesis = createGenesisBlock();
    const block = createBlock(genesis, []);

    const result = validateBlock(block, genesis);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject block with wrong index', () => {
    const genesis = createGenesisBlock();
    const block = createBlock(genesis, []);
    block.header.index = 5; // Wrong index

    const result = validateBlock(block, genesis);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid block index');
  });
});

describe('Ledger State', () => {
  let state: LedgerState;

  beforeEach(() => {
    state = createLedgerState();
  });

  it('should initialize with genesis block', () => {
    expect(state.blocks).toHaveLength(1);
    expect(getBlockHeight(state)).toBe(0);
  });

  it('should create accounts on demand', () => {
    const keyPair = generateKeyPair();
    const account = getOrCreateAccount(state, keyPair.publicKey);

    expect(account.publicKey).toBe(keyPair.publicKey);
    expect(account.balance.available).toBe(0n);
    expect(account.transactionCount).toBe(0);
  });
});

describe('Account Balances', () => {
  let state: LedgerState;
  const alice = generateKeyPair();
  const bob = generateKeyPair();

  beforeEach(() => {
    state = createLedgerState();
  });

  it('should credit an account', () => {
    creditAccount(state, alice.publicKey, 1000n, false);

    const balance = getAccountBalance(state, alice.publicKey);
    expect(balance.available).toBe(1000n);
    expect(balance.total).toBe(1000n);
  });

  it('should credit pending amount', () => {
    creditAccount(state, alice.publicKey, 1000n, true);

    const balance = getAccountBalance(state, alice.publicKey);
    expect(balance.available).toBe(0n);
    expect(balance.pendingIncoming).toBe(1000n);
    expect(balance.total).toBe(1000n);
  });

  it('should debit an account', () => {
    creditAccount(state, alice.publicKey, 1000n, false);
    const success = debitAccount(state, alice.publicKey, 300n, false);

    expect(success).toBe(true);

    const balance = getAccountBalance(state, alice.publicKey);
    expect(balance.available).toBe(700n);
  });

  it('should reject debit for insufficient balance', () => {
    creditAccount(state, alice.publicKey, 100n, false);
    const success = debitAccount(state, alice.publicKey, 500n, false);

    expect(success).toBe(false);

    const balance = getAccountBalance(state, alice.publicKey);
    expect(balance.available).toBe(100n);
  });

  it('should handle pending debit', () => {
    creditAccount(state, alice.publicKey, 1000n, false);
    const success = debitAccount(state, alice.publicKey, 300n, true);

    expect(success).toBe(true);

    const balance = getAccountBalance(state, alice.publicKey);
    expect(balance.available).toBe(700n);
    expect(balance.pendingOutgoing).toBe(300n);
  });

  it('should mint tokens', () => {
    mintTokens(state, alice.publicKey, 5000n);

    const balance = getAccountBalance(state, alice.publicKey);
    expect(balance.available).toBe(5000n);
  });
});

describe('Transaction Processing', () => {
  let state: LedgerState;
  const alice = generateKeyPair();
  const bob = generateKeyPair();

  beforeEach(() => {
    state = createLedgerState();
    mintTokens(state, alice.publicKey, 10000n);
  });

  it('should add a pending transaction', () => {
    const tx = createTransaction(
      {
        sender: alice.publicKey,
        recipient: bob.publicKey,
        amount: 1000n,
      },
      alice.privateKey
    );

    const result = addPendingTransaction(state, tx);

    expect(result.success).toBe(true);

    const aliceBalance = getAccountBalance(state, alice.publicKey);
    expect(aliceBalance.available).toBe(9000n);
    expect(aliceBalance.pendingOutgoing).toBe(1000n);

    const bobBalance = getAccountBalance(state, bob.publicKey);
    expect(bobBalance.pendingIncoming).toBe(1000n);
  });

  it('should reject transaction with insufficient balance', () => {
    const tx = createTransaction(
      {
        sender: alice.publicKey,
        recipient: bob.publicKey,
        amount: 20000n, // More than available
      },
      alice.privateKey
    );

    const result = addPendingTransaction(state, tx);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient balance');
  });

  it('should reject duplicate transaction', () => {
    const tx = createTransaction(
      {
        sender: alice.publicKey,
        recipient: bob.publicKey,
        amount: 1000n,
      },
      alice.privateKey
    );

    addPendingTransaction(state, tx);
    const result = addPendingTransaction(state, tx);

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('should process transaction confirmation', () => {
    const tx = createTransaction(
      {
        sender: alice.publicKey,
        recipient: bob.publicKey,
        amount: 1000n,
      },
      alice.privateKey
    );

    addPendingTransaction(state, tx);

    const confirmResult = confirmTransaction(tx, bob.publicKey);
    expect(confirmResult.success).toBe(true);

    processTransactionStateChange(state, tx, confirmResult.transaction!);

    const aliceBalance = getAccountBalance(state, alice.publicKey);
    expect(aliceBalance.available).toBe(9000n);
    expect(aliceBalance.pendingOutgoing).toBe(0n);

    const bobBalance = getAccountBalance(state, bob.publicKey);
    expect(bobBalance.available).toBe(1000n);
    expect(bobBalance.pendingIncoming).toBe(0n);
  });
});

describe('Pending Transaction Queries', () => {
  let state: LedgerState;
  const alice = generateKeyPair();
  const bob = generateKeyPair();
  const charlie = generateKeyPair();

  beforeEach(() => {
    state = createLedgerState();
    mintTokens(state, alice.publicKey, 10000n);
    mintTokens(state, bob.publicKey, 10000n);
  });

  it('should get pending transactions for an account', () => {
    const tx1 = createTransaction(
      {
        sender: alice.publicKey,
        recipient: bob.publicKey,
        amount: 100n,
      },
      alice.privateKey
    );

    const tx2 = createTransaction(
      {
        sender: bob.publicKey,
        recipient: alice.publicKey,
        amount: 200n,
      },
      bob.privateKey
    );

    addPendingTransaction(state, tx1);
    addPendingTransaction(state, tx2);

    const alicePending = getAccountPendingTransactions(state, alice.publicKey);
    expect(alicePending).toHaveLength(2);

    const charliePending = getAccountPendingTransactions(state, charlie.publicKey);
    expect(charliePending).toHaveLength(0);
  });

  it('should get expired transactions', () => {
    const tx = createTransaction(
      {
        sender: alice.publicKey,
        recipient: bob.publicKey,
        amount: 100n,
      },
      alice.privateKey
    );

    addPendingTransaction(state, tx);

    // Simulate expiration by modifying the stored transaction
    const storedTx = getTransaction(state, tx.id)!;
    state.pendingTransactions.set(tx.id, {
      ...storedTx,
      expiresAt: Date.now() - 1000,
    });

    const expired = getExpiredTransactions(state);
    expect(expired).toHaveLength(1);
    expect(expired[0].id).toBe(tx.id);
  });
});

describe('Block Addition', () => {
  let state: LedgerState;

  beforeEach(() => {
    state = createLedgerState();
  });

  it('should add a block to the chain', () => {
    const result = addBlock(state, []);

    expect(result.success).toBe(true);
    expect(result.block).toBeDefined();
    expect(getBlockHeight(state)).toBe(1);
  });

  it('should retrieve blocks by index and hash', () => {
    addBlock(state, []);

    const byIndex = getBlockByIndex(state, 1);
    expect(byIndex).toBeDefined();
    expect(byIndex?.header.index).toBe(1);

    const genesis = getBlockByIndex(state, 0);
    expect(genesis).toBeDefined();
    expect(genesis?.header.index).toBe(0);
  });
});
