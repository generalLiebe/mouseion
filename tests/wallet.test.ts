/**
 * Tests for wallet management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
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
  exportWallet,
  importWalletFromExport,
  type Wallet,
} from '../src/wallet/wallet.js';
import {
  createLedgerState,
  mintTokens,
  type LedgerState,
} from '../src/blockchain/ledger.js';
import { TransactionState } from '../src/blockchain/types.js';
import { generateKeyPair } from '../src/crypto/index.js';

describe('Wallet Creation', () => {
  it('should create a new wallet', () => {
    const wallet = createWallet('My Wallet');

    expect(wallet.name).toBe('My Wallet');
    expect(wallet.keyPair).toBeDefined();
    expect(wallet.keyPair.publicKey).toBeDefined();
    expect(wallet.keyPair.privateKey).toBeDefined();
    expect(wallet.createdAt).toBeDefined();
  });

  it('should create a wallet without name', () => {
    const wallet = createWallet();

    expect(wallet.name).toBeUndefined();
    expect(wallet.keyPair).toBeDefined();
  });

  it('should import a wallet from existing key pair', () => {
    const keyPair = generateKeyPair();
    const wallet = importWallet(keyPair, 'Imported');

    expect(wallet.keyPair).toBe(keyPair);
    expect(wallet.name).toBe('Imported');
  });

  it('should get wallet address', () => {
    const wallet = createWallet();
    const address = getAddress(wallet);

    expect(address).toBe(wallet.keyPair.publicKey);
  });
});

describe('Wallet Balance', () => {
  let state: LedgerState;
  let wallet: Wallet;

  beforeEach(() => {
    state = createLedgerState();
    wallet = createWallet('Test Wallet');
  });

  it('should return zero balance for new wallet', () => {
    const balance = getBalance(wallet, state);

    expect(balance.available).toBe(0n);
    expect(balance.pendingIncoming).toBe(0n);
    expect(balance.pendingOutgoing).toBe(0n);
    expect(balance.total).toBe(0n);
  });

  it('should reflect minted tokens', () => {
    mintTokens(state, getAddress(wallet), 5000n);

    const balance = getBalance(wallet, state);

    expect(balance.available).toBe(5000n);
    expect(balance.total).toBe(5000n);
  });

  it('should check sufficient balance correctly', () => {
    mintTokens(state, getAddress(wallet), 1000n);

    expect(hasSufficientBalance(wallet, state, 500n)).toBe(true);
    expect(hasSufficientBalance(wallet, state, 1000n)).toBe(true);
    expect(hasSufficientBalance(wallet, state, 1001n)).toBe(false);
  });
});

describe('Sending Transactions', () => {
  let state: LedgerState;
  let alice: Wallet;
  let bob: Wallet;

  beforeEach(() => {
    state = createLedgerState();
    alice = createWallet('Alice');
    bob = createWallet('Bob');
    mintTokens(state, getAddress(alice), 10000n);
  });

  it('should send funds successfully', () => {
    const result = send(alice, state, getAddress(bob), 1000n, { memo: 'Payment' });

    expect(result.success).toBe(true);
    expect(result.transaction).toBeDefined();
    expect(result.transaction?.amount).toBe(1000n);
    expect(result.transaction?.memo).toBe('Payment');
    expect(result.transaction?.state).toBe(TransactionState.PENDING);
  });

  it('should fail with insufficient balance', () => {
    const result = send(alice, state, getAddress(bob), 20000n);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient balance');
  });

  it('should update balances after send', () => {
    send(alice, state, getAddress(bob), 1000n);

    const aliceBalance = getBalance(alice, state);
    expect(aliceBalance.available).toBe(9000n);
    expect(aliceBalance.pendingOutgoing).toBe(1000n);

    const bobBalance = getBalance(bob, state);
    expect(bobBalance.pendingIncoming).toBe(1000n);
  });
});

describe('Confirming Transactions', () => {
  let state: LedgerState;
  let alice: Wallet;
  let bob: Wallet;

  beforeEach(() => {
    state = createLedgerState();
    alice = createWallet('Alice');
    bob = createWallet('Bob');
    mintTokens(state, getAddress(alice), 10000n);
  });

  it('should confirm received transaction', () => {
    const sendResult = send(alice, state, getAddress(bob), 1000n);
    expect(sendResult.success).toBe(true);

    const confirmResult = confirmReceived(bob, state, sendResult.transaction!.id);

    expect(confirmResult.success).toBe(true);
    expect(confirmResult.transaction?.state).toBe(TransactionState.FINALIZED);
  });

  it('should update balances after confirmation', () => {
    const sendResult = send(alice, state, getAddress(bob), 1000n);
    confirmReceived(bob, state, sendResult.transaction!.id);

    const aliceBalance = getBalance(alice, state);
    expect(aliceBalance.available).toBe(9000n);
    expect(aliceBalance.pendingOutgoing).toBe(0n);

    const bobBalance = getBalance(bob, state);
    expect(bobBalance.available).toBe(1000n);
    expect(bobBalance.pendingIncoming).toBe(0n);
  });

  it('should fail for non-existent transaction', () => {
    const result = confirmReceived(bob, state, 'non-existent-id');

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('should fail when confirmed by wrong recipient', () => {
    const sendResult = send(alice, state, getAddress(bob), 1000n);
    const charlie = createWallet('Charlie');

    const result = confirmReceived(charlie, state, sendResult.transaction!.id);

    expect(result.success).toBe(false);
    expect(result.error).toContain('recipient');
  });
});

describe('Cancelling Transactions', () => {
  let state: LedgerState;
  let alice: Wallet;
  let bob: Wallet;

  beforeEach(() => {
    state = createLedgerState();
    alice = createWallet('Alice');
    bob = createWallet('Bob');
    mintTokens(state, getAddress(alice), 10000n);
  });

  it('should cancel sent transaction', () => {
    const sendResult = send(alice, state, getAddress(bob), 1000n);
    expect(sendResult.success).toBe(true);

    const cancelResult = cancelSent(alice, state, sendResult.transaction!.id);

    expect(cancelResult.success).toBe(true);
    expect(cancelResult.transaction?.state).toBe(TransactionState.CANCELLED);
  });

  it('should return funds after cancellation', () => {
    const sendResult = send(alice, state, getAddress(bob), 1000n);
    cancelSent(alice, state, sendResult.transaction!.id);

    const aliceBalance = getBalance(alice, state);
    expect(aliceBalance.available).toBe(10000n);
    expect(aliceBalance.pendingOutgoing).toBe(0n);

    const bobBalance = getBalance(bob, state);
    expect(bobBalance.pendingIncoming).toBe(0n);
  });

  it('should fail when cancelled by non-sender', () => {
    const sendResult = send(alice, state, getAddress(bob), 1000n);

    const result = cancelSent(bob, state, sendResult.transaction!.id);

    expect(result.success).toBe(false);
    expect(result.error).toContain('sender');
  });
});

describe('Transaction History', () => {
  let state: LedgerState;
  let alice: Wallet;
  let bob: Wallet;

  beforeEach(() => {
    state = createLedgerState();
    alice = createWallet('Alice');
    bob = createWallet('Bob');
    mintTokens(state, getAddress(alice), 10000n);
    mintTokens(state, getAddress(bob), 10000n);
  });

  it('should track pending transactions', () => {
    send(alice, state, getAddress(bob), 100n);
    send(alice, state, getAddress(bob), 200n);

    const alicePending = getPendingTransactions(alice, state);
    expect(alicePending).toHaveLength(2);
    expect(alicePending[0].direction).toBe('sent');

    const bobPending = getPendingTransactions(bob, state);
    expect(bobPending).toHaveLength(2);
    expect(bobPending[0].direction).toBe('received');
  });

  it('should track full transaction history', () => {
    const sendResult1 = send(alice, state, getAddress(bob), 100n);
    const sendResult2 = send(bob, state, getAddress(alice), 50n);

    confirmReceived(bob, state, sendResult1.transaction!.id);
    confirmReceived(alice, state, sendResult2.transaction!.id);

    const aliceHistory = getTransactionHistory(alice, state);
    expect(aliceHistory).toHaveLength(2);

    const sent = aliceHistory.find((h) => h.direction === 'sent');
    const received = aliceHistory.find((h) => h.direction === 'received');

    expect(sent).toBeDefined();
    expect(received).toBeDefined();
  });
});

describe('Wallet Export/Import', () => {
  it('should export and import wallet', () => {
    const original = createWallet('Original');
    const exported = exportWallet(original);

    expect(exported.version).toBe(1);
    expect(exported.name).toBe('Original');
    expect(exported.publicKey).toBe(original.keyPair.publicKey);
    expect(exported.privateKey).toBe(original.keyPair.privateKey);

    const imported = importWalletFromExport(exported);

    expect(imported.name).toBe(original.name);
    expect(imported.keyPair.publicKey).toBe(original.keyPair.publicKey);
    expect(imported.keyPair.privateKey).toBe(original.keyPair.privateKey);
  });

  it('should reject unsupported export version', () => {
    const exported = {
      version: 999,
      publicKey: 'abc',
      privateKey: 'def',
      createdAt: Date.now(),
    };

    expect(() => importWalletFromExport(exported)).toThrow('Unsupported');
  });
});
