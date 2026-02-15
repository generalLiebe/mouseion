/**
 * Tests for transaction management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTransaction,
  confirmTransaction,
  cancelTransaction,
  freezeTransaction,
  recoverTransaction,
  approveFrozenTransaction,
  processExpiredTransaction,
  validateTransaction,
  isValidTransition,
  isTerminalState,
  isPending,
  isFinalized,
  isExpired,
} from '../src/blockchain/transaction.js';
import { TransactionState, DEFAULT_CONFIG } from '../src/blockchain/types.js';
import { generateKeyPair } from '../src/crypto/index.js';

describe('Transaction Creation', () => {
  const sender = generateKeyPair();
  const recipient = generateKeyPair();

  it('should create a valid transaction', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
        memo: 'Test payment',
      },
      sender.privateKey
    );

    expect(tx.sender).toBe(sender.publicKey);
    expect(tx.recipient).toBe(recipient.publicKey);
    expect(tx.amount).toBe(1000n);
    expect(tx.memo).toBe('Test payment');
    expect(tx.state).toBe(TransactionState.PENDING);
    expect(tx.version).toBe(1);
    expect(tx.signature).toBeDefined();
  });

  it('should create a transaction with handshake', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 500n,
        useHandshake: true,
      },
      sender.privateKey
    );

    expect(tx.handshake).not.toBeNull();
    expect(tx.handshake?.handshakeId).toBeDefined();
    expect(tx.handshake?.ackId).toBeNull();
  });

  it('should enforce grace period limits', () => {
    expect(() =>
      createTransaction(
        {
          sender: sender.publicKey,
          recipient: recipient.publicKey,
          amount: 100n,
          gracePeriod: 1000, // Too short
        },
        sender.privateKey
      )
    ).toThrow();

    expect(() =>
      createTransaction(
        {
          sender: sender.publicKey,
          recipient: recipient.publicKey,
          amount: 100n,
          gracePeriod: 100 * 60 * 60 * 1000, // Too long
        },
        sender.privateKey
      )
    ).toThrow();
  });
});

describe('State Transitions', () => {
  const sender = generateKeyPair();
  const recipient = generateKeyPair();
  let tx: ReturnType<typeof createTransaction>;

  beforeEach(() => {
    tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
      },
      sender.privateKey
    );
  });

  it('should validate PENDING transitions', () => {
    expect(isValidTransition(TransactionState.PENDING, TransactionState.FINALIZED)).toBe(true);
    expect(isValidTransition(TransactionState.PENDING, TransactionState.CANCELLED)).toBe(true);
    expect(isValidTransition(TransactionState.PENDING, TransactionState.FROZEN)).toBe(true);
    expect(isValidTransition(TransactionState.PENDING, TransactionState.RECOVERED)).toBe(false);
  });

  it('should validate FROZEN transitions', () => {
    expect(isValidTransition(TransactionState.FROZEN, TransactionState.FINALIZED)).toBe(true);
    expect(isValidTransition(TransactionState.FROZEN, TransactionState.RECOVERED)).toBe(true);
    expect(isValidTransition(TransactionState.FROZEN, TransactionState.CANCELLED)).toBe(false);
  });

  it('should identify terminal states', () => {
    expect(isTerminalState(TransactionState.FINALIZED)).toBe(true);
    expect(isTerminalState(TransactionState.CANCELLED)).toBe(true);
    expect(isTerminalState(TransactionState.RECOVERED)).toBe(true);
    expect(isTerminalState(TransactionState.PENDING)).toBe(false);
    expect(isTerminalState(TransactionState.FROZEN)).toBe(false);
  });

  it('should confirm a transaction', () => {
    const result = confirmTransaction(tx, recipient.publicKey);

    expect(result.success).toBe(true);
    expect(result.transaction?.state).toBe(TransactionState.FINALIZED);
    expect(result.transaction?.version).toBe(2);
  });

  it('should reject confirmation from non-recipient', () => {
    const result = confirmTransaction(tx, sender.publicKey);

    expect(result.success).toBe(false);
    expect(result.error).toContain('recipient');
  });

  it('should cancel a transaction', () => {
    const result = cancelTransaction(tx, sender.publicKey);

    expect(result.success).toBe(true);
    expect(result.transaction?.state).toBe(TransactionState.CANCELLED);
  });

  it('should reject cancellation from non-sender', () => {
    const result = cancelTransaction(tx, recipient.publicKey);

    expect(result.success).toBe(false);
    expect(result.error).toContain('sender');
  });

  it('should freeze a transaction', () => {
    const result = freezeTransaction(tx, 'Suspicious activity');

    expect(result.success).toBe(true);
    expect(result.transaction?.state).toBe(TransactionState.FROZEN);
  });

  it('should recover a frozen transaction', () => {
    const frozenResult = freezeTransaction(tx, 'Review needed');
    expect(frozenResult.success).toBe(true);

    const recoverResult = recoverTransaction(frozenResult.transaction!);

    expect(recoverResult.success).toBe(true);
    expect(recoverResult.transaction?.state).toBe(TransactionState.RECOVERED);
  });

  it('should approve a frozen transaction', () => {
    const frozenResult = freezeTransaction(tx, 'Review needed');
    expect(frozenResult.success).toBe(true);

    const approveResult = approveFrozenTransaction(frozenResult.transaction!);

    expect(approveResult.success).toBe(true);
    expect(approveResult.transaction?.state).toBe(TransactionState.FINALIZED);
  });
});

describe('Transaction Expiration', () => {
  const sender = generateKeyPair();
  const recipient = generateKeyPair();

  it('should process expired transaction with auto-finalize', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
        gracePeriod: DEFAULT_CONFIG.minGracePeriod,
      },
      sender.privateKey
    );

    // Simulate expiration by modifying expiresAt
    const expiredTx = { ...tx, expiresAt: Date.now() - 1000 };

    const result = processExpiredTransaction(expiredTx, true);

    expect(result.success).toBe(true);
    expect(result.transaction?.state).toBe(TransactionState.FINALIZED);
  });

  it('should process expired transaction with auto-return', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
        gracePeriod: DEFAULT_CONFIG.minGracePeriod,
      },
      sender.privateKey
    );

    // Simulate expiration
    const expiredTx = { ...tx, expiresAt: Date.now() - 1000 };

    const result = processExpiredTransaction(expiredTx, false);

    expect(result.success).toBe(true);
    expect(result.transaction?.state).toBe(TransactionState.CANCELLED);
  });

  it('should reject processing non-expired transaction', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
      },
      sender.privateKey
    );

    const result = processExpiredTransaction(tx, true);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not expired');
  });
});

describe('Transaction Validation', () => {
  const sender = generateKeyPair();
  const recipient = generateKeyPair();

  it('should validate a correct transaction', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
      },
      sender.privateKey
    );

    const result = validateTransaction(tx);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject transaction with same sender and recipient', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: sender.publicKey, // Same as sender
        amount: 1000n,
      },
      sender.privateKey
    );

    const result = validateTransaction(tx);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Sender and recipient cannot be the same');
  });
});

describe('Transaction Query Functions', () => {
  const sender = generateKeyPair();
  const recipient = generateKeyPair();

  it('should identify pending transactions', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
      },
      sender.privateKey
    );

    expect(isPending(tx)).toBe(true);
    expect(isFinalized(tx)).toBe(false);
  });

  it('should identify finalized transactions', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
      },
      sender.privateKey
    );

    const result = confirmTransaction(tx, recipient.publicKey);

    expect(isPending(result.transaction!)).toBe(false);
    expect(isFinalized(result.transaction!)).toBe(true);
  });

  it('should identify expired transactions', () => {
    const tx = createTransaction(
      {
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        amount: 1000n,
        gracePeriod: DEFAULT_CONFIG.minGracePeriod,
      },
      sender.privateKey
    );

    // Not expired yet
    expect(isExpired(tx)).toBe(false);

    // Simulate expiration
    const expiredTx = { ...tx, expiresAt: Date.now() - 1000 };
    expect(isExpired(expiredTx)).toBe(true);
  });
});
