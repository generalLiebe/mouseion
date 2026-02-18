/**
 * Contact / Address Book types
 */

export interface Contact {
  name: string;
  address: string; // 64 hex chars (SHA-256 public key hash)
  memo?: string;
  createdAt: number;
}
