# Reversible Transaction Blockchain Specification

**Version 0.1 - Draft**

## 1. Overview

This specification describes a novel Layer 1 blockchain designed to prevent losses from accidental transfers and fraud through built-in transaction reversibility.

### 1.1 Design Philosophy

The core principle is: **transactions are not immediately finalized but held in a pending state until confirmed by both sender and recipient**.

This enables:
- Recovery from accidental transfers
- Fraud prevention through review periods
- Safe multi-party transactions

### 1.2 Implementation Language

- **Primary**: Julia
- **Rationale**: High-performance numeric computing, easy experimentation with fee algorithms, strong parallel processing support

---

## 2. Architecture

### 2.1 Three-Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 2 (Future)                                           │
│  - Batch processing, scaling solutions                      │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                          │
│  - Wallet UI, DApps, Services                               │
│  - Safety checks, evidence management                       │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 (Blockchain Core)                                  │
│  - Ledger, state management                                 │
│  - Pending/finalized transaction states                     │
│  - Julia implementation                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Transaction Flow

### 3.1 Basic Flow

```
1. SEND
   User initiates transfer via wallet.
   Recipient wallet returns acceptance rules (immediate/pending).
   If pending: transaction recorded as "Pending", funds deducted from sender.

2. CONFIRM
   Recipient presses "Confirm Receipt" button.
   Blockchain records confirmation, transaction finalized.
   Timeout: Auto-finalize or auto-return based on settings.

3. CANCEL
   Sender can cancel while recipient hasn't confirmed.
   Small cancellation fee required (abuse prevention).

4. FRAUD HANDLING
   Suspicious transactions can be flagged and frozen.
   Guardians (trusted multi-sig) review and decide on recovery.
```

### 3.2 State Diagram

```
                    ┌─────────────┐
                    │   Created   │
                    └──────┬──────┘
                           │
                           ▼
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Cancelled   │◄───│   Pending   │───►│   Frozen     │
└──────────────┘    └──────┬──────┘    └──────┬───────┘
       ▲                   │                  │
       │                   ▼                  ▼
       │            ┌─────────────┐    ┌──────────────┐
       └────────────│  Finalized  │    │  Recovered   │
                    └─────────────┘    └──────────────┘
```

---

## 4. Transaction States

| State | Description |
|:--|:--|
| **Pending** | Transfer executed but not yet confirmed by recipient |
| **Finalized** | Recipient confirmed or auto-finalized by timeout |
| **Cancelled** | Sender requested cancellation before finalization |
| **Frozen** | Flagged for fraud, under guardian review |
| **Recovered** | Funds returned to sender after guardian approval |

---

## 5. Safety Mechanisms

### 5.1 Intent Binding

- Transfer includes: destination, amount, memo (purpose)
- All signed together
- Transaction invalid if any mismatch

### 5.2 Handshake Protocol

Recipient wallet automatically returns "receipt confirmation message".
If no response: automatically treated as pending.

### 5.3 Cancellation Limits

- Small fee required for cancellation (abuse prevention)
- Limits on cancellation count and total amount
- Rate limiting on concurrent cancellations

### 5.4 Fraud Protection

- Multiple reports trigger automatic freeze
- Guardian multi-sig for fund recovery
- Evidence stored off-chain, hash only on-chain

---

## 6. One-Time Key (Passphrase) System

### 6.1 Purpose

Ensure both sender and recipient possess the same passphrase before transfer completes, reducing misdirection and impersonation.

### 6.2 Mechanism

1. Sender wallet generates unique passphrase (random string/QR)
2. Passphrase delivered to recipient (app message/QR/link)
3. Recipient returns confirmation using same passphrase
4. Ledger stores only hash of passphrase
5. Matching confirmation hash advances pending → finalized

### 6.3 Two Modes

**Simple Handshake**
- Sender creates passphrase
- Recipient returns passphrase verbatim
- Match confirms transfer
- Pro: Simple implementation
- Con: Vulnerable if passphrase intercepted

**Strong Handshake**
- Sender creates passphrase
- Recipient returns response mixed with their secret
- Ledger verifies correspondence without revealing secrets
- Pro: Resistant to interception

### 6.4 Transaction Record Fields

```julia
struct Transaction
    # ... existing fields ...
    handshake_id::String      # Hash of passphrase
    ack_id::String            # Hash of recipient response
    state::TransactionState   # Pending(awaiting handshake) → Matched → Finalized/Cancelled
end
```

### 6.5 Fallback for Legacy Wallets

If recipient wallet doesn't support handshake:
- Fall back to traditional pending → confirm button → finalized

---

## 7. Guardian System

### 7.1 Role

Guardians are trusted entities who review and decide on disputed transactions.

### 7.2 Requirements

- Minimum stake required
- Geographic/organizational diversity
- Public audit logs

### 7.3 Decision Process

- k-of-m multi-signature required
- SLA for response time
- Escalation if timeout

### 7.4 Slashing Conditions

- Incorrect determinations
- Collusion detected
- Inactivity beyond threshold

---

## 8. Parameters

### 8.1 Timing

| Parameter | Default | Range |
|:--|:--|:--|
| MIN_GRACE_PERIOD | 3 minutes | - |
| MAX_GRACE_PERIOD | 24 hours | - |
| DEFAULT_GRACE_PERIOD | 1 hour | - |
| HANDSHAKE_EXPIRY | 5 minutes | - |

### 8.2 Fees

| Operation | Fee Structure |
|:--|:--|
| Standard Transfer | Base fee + % of amount |
| Cancellation | Fixed fee + % of amount |
| Guardian Review | Funded by frozen amount |

### 8.3 Limits

| Parameter | Default |
|:--|:--|
| MAX_CANCELLATIONS_PER_HOUR | 10 |
| MAX_CANCELLATION_AMOUNT_DAILY | TBD |

---

## 9. Data Structures

### 9.1 Transaction

```julia
@enum TransactionState begin
    PENDING
    FINALIZED
    CANCELLED
    FROZEN
    RECOVERED
end

struct Transaction
    id::UUID
    sender::PublicKey
    recipient::PublicKey
    amount::BigInt
    memo::String
    created_at::DateTime
    expires_at::DateTime
    state::TransactionState
    version::Int  # For optimistic locking
    handshake_id::Union{Nothing, String}
    ack_id::Union{Nothing, String}
end
```

### 9.2 Block

```julia
struct Block
    index::Int
    timestamp::DateTime
    transactions::Vector{Transaction}
    previous_hash::String
    hash::String
    nonce::Int
end
```

---

## 10. Risk Mitigations

### 10.1 MVP Requirements (starred items are mandatory)

| Risk | Mitigation |
|:--|:--|
| Race conditions | ★ Atomic state transitions with version locks |
| Passphrase interception | ★ Strong handshake mode, short expiry, nonce |
| Cancellation spam | ★ Fees + rate limits + account scoring |
| Abandoned funds | ★ Timeout auto-processing |
| Weak randomness | ★ OS CSPRNG for all random generation |
| Time skew | ★ Block-relative timestamps |
| Encoding ambiguity | ★ Strict deterministic encoding (CBOR/MessagePack) |
| Storage bloat | ★ Auto-cleanup of expired pending records |

### 10.2 Future Considerations

- Cross-chain bridge policies
- Front-running protection
- Layer 2 scaling

---

## 11. Development Priorities (MVP)

1. Single-node basic ledger (pending → finalized → cancelled)
2. Simple web wallet (send/receive buttons only)
3. Minimal freeze/recovery flow (manual approval)
4. Testing and UX refinement
5. Multi-node sync and testing

---

## 12. Uniqueness Summary

- **Pending-based transfer**: Prevention of accidental loss at protocol level
- **Recipient consent**: Built into Layer 1 ledger
- **Julia implementation**: Research and experimentation friendly
- **Human-centric design**: Two-button operation
- **Future-ready**: AI and legal system integration considered

---

*This specification is a working draft and subject to change.*
