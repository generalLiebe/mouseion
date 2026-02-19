/**
 * Tests for cryptographic utilities — encryption/decryption
 */

import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  encryptPrivateKey,
  decryptPrivateKey,
  isEncryptedKey,
  type EncryptedKey,
} from '../src/crypto/index.js';

describe('Private Key Encryption', () => {
  const keyPair = generateKeyPair();

  it('should encrypt and decrypt a private key (roundtrip)', () => {
    const password = 'test-password-123';
    const encrypted = encryptPrivateKey(keyPair.privateKey, password);
    const decrypted = decryptPrivateKey(encrypted, password);

    expect(decrypted).toBe(keyPair.privateKey);
  });

  it('should produce different ciphertexts for the same key (random salt/iv)', () => {
    const password = 'same-password';
    const enc1 = encryptPrivateKey(keyPair.privateKey, password);
    const enc2 = encryptPrivateKey(keyPair.privateKey, password);

    // Salt and IV should differ → ciphertext differs
    expect(enc1.salt).not.toBe(enc2.salt);
    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);

    // Both should still decrypt to the same key
    expect(decryptPrivateKey(enc1, password)).toBe(keyPair.privateKey);
    expect(decryptPrivateKey(enc2, password)).toBe(keyPair.privateKey);
  });

  it('should fail with wrong password', () => {
    const encrypted = encryptPrivateKey(keyPair.privateKey, 'correct-password');

    expect(() => decryptPrivateKey(encrypted, 'wrong-password')).toThrow();
  });

  it('should handle empty password', () => {
    const password = '';
    const encrypted = encryptPrivateKey(keyPair.privateKey, password);
    const decrypted = decryptPrivateKey(encrypted, password);

    expect(decrypted).toBe(keyPair.privateKey);
  });

  it('should handle unicode password', () => {
    const password = 'パスワード🔑';
    const encrypted = encryptPrivateKey(keyPair.privateKey, password);
    const decrypted = decryptPrivateKey(encrypted, password);

    expect(decrypted).toBe(keyPair.privateKey);
  });
});

describe('isEncryptedKey type guard', () => {
  it('should identify a valid EncryptedKey', () => {
    const keyPair = generateKeyPair();
    const encrypted = encryptPrivateKey(keyPair.privateKey, 'password');

    expect(isEncryptedKey(encrypted)).toBe(true);
  });

  it('should reject plain string (unencrypted private key)', () => {
    expect(isEncryptedKey('-----BEGIN PRIVATE KEY-----\nMC...\n-----END PRIVATE KEY-----')).toBe(false);
  });

  it('should reject null and undefined', () => {
    expect(isEncryptedKey(null)).toBe(false);
    expect(isEncryptedKey(undefined)).toBe(false);
  });

  it('should reject objects missing required fields', () => {
    expect(isEncryptedKey({ encrypted: true })).toBe(false);
    expect(isEncryptedKey({ encrypted: true, ciphertext: 'abc' })).toBe(false);
    expect(isEncryptedKey({ encrypted: true, ciphertext: 'a', salt: 'b', iv: 'c' })).toBe(false);
  });

  it('should reject objects with encrypted !== true', () => {
    expect(isEncryptedKey({
      encrypted: false,
      ciphertext: 'a',
      salt: 'b',
      iv: 'c',
      tag: 'd',
    })).toBe(false);
  });

  it('should reject objects with non-string fields', () => {
    expect(isEncryptedKey({
      encrypted: true,
      ciphertext: 123,
      salt: 'b',
      iv: 'c',
      tag: 'd',
    })).toBe(false);
  });
});
