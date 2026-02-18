/**
 * Frontend type definitions
 * All amounts are strings (BigInt serialized) in API responses
 */

export interface ApiWallet {
  name?: string;
  address: string;
  createdAt: number;
  isActive: boolean;
}

export interface ApiBalance {
  available: string;
  pendingOutgoing: string;
  pendingIncoming: string;
  total: string;
}

export interface ApiTransaction {
  id: string;
  sender: string;
  recipient: string;
  amount: string;
  memo: string;
  state: TransactionStateType;
  createdAt: number;
  expiresAt: number;
  updatedAt: number;
  version: number;
}

export type TransactionStateType =
  | "PENDING"
  | "FINALIZED"
  | "CANCELLED"
  | "FROZEN"
  | "RECOVERED";

export type TransactionDirection = "sent" | "received";

export interface ApiTransactionEntry {
  transaction: ApiTransaction;
  direction: TransactionDirection;
  counterparty: string;
}

export interface ApiStatus {
  blockHeight: number;
  totalAccounts: number;
  pendingTransactions: number;
  walletCount: number;
  activeWallet: string | null;
}

export interface ApiContact {
  name: string;
  address: string;
  memo?: string;
  createdAt: number;
}

export interface ApiError {
  error: string;
}

export interface ApiSuccess<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const GRACE_PERIOD_OPTIONS = [
  { label: "3 minutes", value: 3 * 60 * 1000 },
  { label: "15 minutes", value: 15 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "6 hours", value: 6 * 60 * 60 * 1000 },
  { label: "24 hours", value: 24 * 60 * 60 * 1000 },
] as const;
