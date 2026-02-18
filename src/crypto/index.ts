/**
 * Cryptographic utilities for Mouseion blockchain
 *
 * Uses Node.js built-in crypto module for security
 */

import {
  createHash,
  randomBytes,
  generateKeyPairSync,
  sign as cryptoSign,
  verify as cryptoVerify,
  KeyObject,
  createPrivateKey,
  createPublicKey,
  scryptSync,
  createCipheriv,
  createDecipheriv,
} from 'crypto';
import type { Hash, PublicKey, Signature } from '../blockchain/types.js';

// ============================================================================
// Hashing
// ============================================================================

/**
 * Compute SHA-256 hash of data
 */
export function sha256(data: string | Buffer): Hash {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Compute hash of an object (deterministic JSON serialization)
 */
export function hashObject(obj: unknown): Hash {
  // Sort keys for deterministic serialization
  const serialized = JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
  return sha256(serialized);
}

/**
 * Compute Merkle root of a list of hashes
 */
export function computeMerkleRoot(hashes: Hash[]): Hash {
  if (hashes.length === 0) {
    return sha256('');
  }

  if (hashes.length === 1) {
    return hashes[0];
  }

  const nextLevel: Hash[] = [];

  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = hashes[i + 1] ?? left; // Duplicate last if odd number
    nextLevel.push(sha256(left + right));
  }

  return computeMerkleRoot(nextLevel);
}

// ============================================================================
// Random Generation
// ============================================================================

/**
 * Generate cryptographically secure random bytes
 */
export function generateRandomBytes(length: number): Buffer {
  return randomBytes(length);
}

/**
 * Generate a random hex string
 */
export function generateRandomHex(length: number): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  const bytes = randomBytes(16);
  // Set version (4) and variant (RFC4122)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * Generate a one-time key (passphrase) for handshake
 */
export function generateOneTimeKey(): string {
  return generateRandomHex(32);
}

// ============================================================================
// Key Pair Generation
// ============================================================================

/**
 * Key pair for signing transactions
 */
export interface KeyPair {
  publicKey: PublicKey;
  privateKey: string;
  /** Raw PEM public key for verification */
  publicKeyPem: string;
}

/**
 * Generate a new key pair (Ed25519)
 */
export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  // Use hash of public key as the address (similar to blockchain addresses)
  const pubKeyHash = sha256(publicKey);

  return {
    publicKey: pubKeyHash,
    privateKey: privateKey,
    publicKeyPem: publicKey,
  };
}

// ============================================================================
// Signing and Verification
// ============================================================================

/**
 * Sign data with a private key (Ed25519)
 */
export function sign(data: string | Buffer, privateKey: string): Signature {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
  const keyObject = createPrivateKey(privateKey);
  const signature = cryptoSign(null, dataBuffer, keyObject);
  return signature.toString('hex');
}

/**
 * Sign an object (deterministic JSON serialization)
 */
export function signObject(obj: unknown, privateKey: string): Signature {
  const serialized = JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
  return sign(serialized, privateKey);
}

/**
 * Verify a signature (Ed25519)
 */
export function verify(
  data: string | Buffer,
  signature: Signature,
  publicKeyPem: string
): boolean {
  try {
    const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
    const signatureBuffer = Buffer.from(signature, 'hex');
    const keyObject = createPublicKey(publicKeyPem);
    return cryptoVerify(null, dataBuffer, keyObject, signatureBuffer);
  } catch {
    return false;
  }
}

/**
 * Verify an object signature
 */
export function verifyObject(
  obj: unknown,
  signature: Signature,
  publicKeyPem: string
): boolean {
  const serialized = JSON.stringify(obj, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
  return verify(serialized, signature, publicKeyPem);
}

// ============================================================================
// Handshake Utilities
// ============================================================================

/**
 * Create a handshake ID from a one-time key
 */
export function createHandshakeId(oneTimeKey: string): Hash {
  return sha256(`handshake:${oneTimeKey}`);
}

/**
 * Create an acknowledgment ID for a handshake
 */
export function createAckId(oneTimeKey: string, recipientPublicKey: PublicKey): Hash {
  return sha256(`ack:${oneTimeKey}:${recipientPublicKey}`);
}

/**
 * Verify handshake match
 */
export function verifyHandshake(
  handshakeId: Hash,
  ackId: Hash,
  oneTimeKey: string,
  recipientPublicKey: PublicKey
): boolean {
  const expectedHandshakeId = createHandshakeId(oneTimeKey);
  const expectedAckId = createAckId(oneTimeKey, recipientPublicKey);

  return handshakeId === expectedHandshakeId && ackId === expectedAckId;
}

// ============================================================================
// Private Key Encryption (AES-256-GCM with scrypt KDF)
// ============================================================================

/**
 * Encrypted private key representation
 */
export interface EncryptedKey {
  encrypted: true;
  ciphertext: string; // hex
  salt: string;       // hex
  iv: string;         // hex
  tag: string;        // hex
}

/**
 * Encrypt a PEM private key with a password
 * Uses scrypt for key derivation and AES-256-GCM for encryption
 */
export function encryptPrivateKey(pem: string, password: string): EncryptedKey {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(pem, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: true,
    ciphertext: encrypted.toString('hex'),
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt an encrypted private key with a password
 * Returns the original PEM string
 */
export function decryptPrivateKey(data: EncryptedKey, password: string): string {
  const salt = Buffer.from(data.salt, 'hex');
  const iv = Buffer.from(data.iv, 'hex');
  const tag = Buffer.from(data.tag, 'hex');
  const ciphertext = Buffer.from(data.ciphertext, 'hex');
  const key = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Type guard to check if a value is an encrypted key
 */
export function isEncryptedKey(value: unknown): value is EncryptedKey {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    obj.encrypted === true &&
    typeof obj.ciphertext === 'string' &&
    typeof obj.salt === 'string' &&
    typeof obj.iv === 'string' &&
    typeof obj.tag === 'string'
  );
}
