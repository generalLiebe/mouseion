/**
 * State management for CLI
 *
 * Handles persistence of wallet and ledger state between CLI invocations
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Wallet } from '../wallet/wallet.js';
import { LedgerState, createLedgerState } from '../blockchain/ledger.js';
import { TransactionState } from '../blockchain/types.js';
import {
  EncryptedKey,
  encryptPrivateKey,
  decryptPrivateKey,
  isEncryptedKey,
} from '../crypto/index.js';
import type { Contact } from '../contacts/types.js';

// ============================================================================
// Types
// ============================================================================

export interface CLIState {
  ledger: LedgerState;
  wallets: Wallet[];
  activeWallet: Wallet | null;
  contacts: Contact[];
}

interface SerializedWallet {
  version: number;
  name?: string;
  publicKey: string;
  privateKey: string | EncryptedKey;
  publicKeyPem: string;
  createdAt: number;
}

interface SerializedState {
  version: number;
  encrypted?: boolean;
  wallets: SerializedWallet[];
  activeWalletIndex: number | null;
  ledger: SerializedLedger;
  contacts?: Contact[];
}

interface SerializedLedger {
  blocks: any[];
  accounts: [string, any][];
  pendingTransactions: [string, any][];
  transactionIndex: [string, any][];
}

// ============================================================================
// State Manager
// ============================================================================

export class StateManager {
  private statePath: string;
  private password: string | null = null;

  constructor(customPath?: string) {
    const configDir = customPath || path.join(os.homedir(), '.mouseion');

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    this.statePath = path.join(configDir, 'state.json');
  }

  /**
   * Set password for encryption/decryption operations
   */
  setPassword(password: string): void {
    this.password = password;
  }

  /**
   * Check if a password has been set
   */
  hasPassword(): boolean {
    return this.password !== null;
  }

  /**
   * Check if the saved state file has encrypted keys
   */
  isStateEncrypted(): boolean {
    if (!fs.existsSync(this.statePath)) {
      return false;
    }
    try {
      const data = fs.readFileSync(this.statePath, 'utf-8');
      const serialized: SerializedState = JSON.parse(data);
      return serialized.encrypted === true;
    } catch {
      return false;
    }
  }

  /**
   * Load state from disk, or create fresh state
   */
  load(): CLIState {
    if (!fs.existsSync(this.statePath)) {
      return {
        ledger: createLedgerState(),
        wallets: [],
        activeWallet: null,
        contacts: [],
      };
    }

    try {
      const data = fs.readFileSync(this.statePath, 'utf-8');
      const serialized: SerializedState = JSON.parse(data);

      return this.deserialize(serialized);
    } catch (error) {
      console.error('Warning: Could not load state, starting fresh');
      return {
        ledger: createLedgerState(),
        wallets: [],
        activeWallet: null,
        contacts: [],
      };
    }
  }

  /**
   * Load state without decrypting private keys (no password needed)
   * Private keys are set to empty strings — only use for read-only operations
   */
  loadPublicOnly(): CLIState {
    if (!fs.existsSync(this.statePath)) {
      return {
        ledger: createLedgerState(),
        wallets: [],
        activeWallet: null,
        contacts: [],
      };
    }

    try {
      const data = fs.readFileSync(this.statePath, 'utf-8');
      const serialized: SerializedState = JSON.parse(data);

      const wallets: Wallet[] = serialized.wallets.map((w) => ({
        keyPair: {
          publicKey: w.publicKey,
          privateKey: '', // No private key without password
          publicKeyPem: w.publicKeyPem,
        },
        name: w.name,
        createdAt: w.createdAt,
      }));

      const activeWallet =
        serialized.activeWalletIndex !== null
          ? wallets[serialized.activeWalletIndex]
          : null;

      return {
        wallets,
        activeWallet,
        ledger: this.deserializeLedger(serialized.ledger),
        contacts: serialized.contacts || [],
      };
    } catch (error) {
      console.error('Warning: Could not load state, starting fresh');
      return {
        ledger: createLedgerState(),
        wallets: [],
        activeWallet: null,
        contacts: [],
      };
    }
  }

  /**
   * Save contacts only — does not touch private keys (no password needed)
   */
  saveContactsOnly(contacts: Contact[]): void {
    if (!fs.existsSync(this.statePath)) {
      // No state file — nothing to save contacts to
      return;
    }

    const data = fs.readFileSync(this.statePath, 'utf-8');
    const serialized: SerializedState = JSON.parse(data);
    serialized.contacts = contacts;

    fs.writeFileSync(this.statePath, JSON.stringify(serialized, this.bigIntReplacer, 2));
    fs.chmodSync(this.statePath, 0o600);
  }

  /**
   * Save state to disk
   */
  save(state: CLIState): void {
    const serialized = this.serialize(state);
    fs.writeFileSync(this.statePath, JSON.stringify(serialized, this.bigIntReplacer, 2));
    fs.chmodSync(this.statePath, 0o600);
  }

  /**
   * Reset all state
   */
  reset(): void {
    if (fs.existsSync(this.statePath)) {
      fs.unlinkSync(this.statePath);
    }
  }

  /**
   * Get state file path
   */
  getStatePath(): string {
    return this.statePath;
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  private serialize(state: CLIState): SerializedState {
    const hasEncryption = this.password !== null;

    const walletExports: SerializedWallet[] = state.wallets.map((w) => ({
      version: 1,
      name: w.name,
      publicKey: w.keyPair.publicKey,
      privateKey: hasEncryption
        ? encryptPrivateKey(w.keyPair.privateKey, this.password!)
        : w.keyPair.privateKey,
      publicKeyPem: w.keyPair.publicKeyPem,
      createdAt: w.createdAt,
    }));

    const activeIndex = state.activeWallet
      ? state.wallets.findIndex(
          (w) => w.keyPair.publicKey === state.activeWallet!.keyPair.publicKey
        )
      : null;

    return {
      version: 1,
      encrypted: hasEncryption,
      wallets: walletExports,
      activeWalletIndex: activeIndex,
      ledger: this.serializeLedger(state.ledger),
      contacts: state.contacts || [],
    };
  }

  private deserialize(serialized: SerializedState): CLIState {
    const wallets: Wallet[] = serialized.wallets.map((w) => {
      let privateKey: string;

      if (isEncryptedKey(w.privateKey)) {
        if (!this.password) {
          throw new Error('Password required to decrypt wallet');
        }
        privateKey = decryptPrivateKey(w.privateKey, this.password);
      } else {
        privateKey = w.privateKey;
      }

      return {
        keyPair: {
          publicKey: w.publicKey,
          privateKey,
          publicKeyPem: w.publicKeyPem,
        },
        name: w.name,
        createdAt: w.createdAt,
      };
    });

    const activeWallet =
      serialized.activeWalletIndex !== null
        ? wallets[serialized.activeWalletIndex]
        : null;

    return {
      wallets,
      activeWallet,
      ledger: this.deserializeLedger(serialized.ledger),
      contacts: serialized.contacts || [],
    };
  }

  private serializeLedger(ledger: LedgerState): SerializedLedger {
    return {
      blocks: ledger.blocks,
      accounts: Array.from(ledger.accounts.entries()).map(([k, v]) => [
        k,
        {
          ...v,
          balance: {
            available: v.balance.available.toString(),
            pendingOutgoing: v.balance.pendingOutgoing.toString(),
            pendingIncoming: v.balance.pendingIncoming.toString(),
            total: v.balance.total.toString(),
          },
        },
      ]),
      pendingTransactions: Array.from(ledger.pendingTransactions.entries()).map(
        ([k, v]) => [k, this.serializeTransaction(v)]
      ),
      transactionIndex: Array.from(ledger.transactionIndex.entries()).map(
        ([k, v]) => [k, this.serializeTransaction(v)]
      ),
    };
  }

  private deserializeLedger(serialized: SerializedLedger): LedgerState {
    return {
      blocks: serialized.blocks,
      accounts: new Map(
        serialized.accounts.map(([k, v]) => [
          k,
          {
            ...v,
            balance: {
              available: BigInt(v.balance.available),
              pendingOutgoing: BigInt(v.balance.pendingOutgoing),
              pendingIncoming: BigInt(v.balance.pendingIncoming),
              total: BigInt(v.balance.total),
            },
          },
        ])
      ),
      pendingTransactions: new Map(
        serialized.pendingTransactions.map(([k, v]) => [
          k,
          this.deserializeTransaction(v),
        ])
      ),
      transactionIndex: new Map(
        serialized.transactionIndex.map(([k, v]) => [
          k,
          this.deserializeTransaction(v),
        ])
      ),
    };
  }

  private serializeTransaction(tx: any): any {
    return {
      ...tx,
      amount: tx.amount.toString(),
    };
  }

  private deserializeTransaction(tx: any): any {
    return {
      ...tx,
      amount: BigInt(tx.amount),
    };
  }

  private bigIntReplacer(_key: string, value: any): any {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }
}
