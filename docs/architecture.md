# Mouseion Architecture

## Overview

Mouseion is designed as a three-layer architecture that separates concerns while enabling seamless integration between components.

## System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Wallet  │  │   Data   │  │ Reward   │  │  Market  │        │
│  │    UI    │  │ Registry │  │Dashboard │  │  Place   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐                                     │
│  │Governance│  │  Expert  │                                     │
│  │  Voting  │  │  Portal  │                                     │
│  └──────────┘  └──────────┘                                     │
├─────────────────────────────────────────────────────────────────┤
│                     SERVICE LAYER                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  Contribution  │  │    Reward      │  │   Governance   │    │
│  │   Tracking     │  │  Distribution  │  │    Engine      │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │     Data       │  │    Expert      │  │    Version     │    │
│  │   Management   │  │   Selection    │  │    Control     │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                      LAYER 1 (BASE)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Reversible Transaction Blockchain (Julia)         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ Pending  │  │  Cancel  │  │ Guardian │  │ One-time │  │  │
│  │  │ Transfer │  │  Logic   │  │ Approval │  │   Keys   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Layer 1: Reversible Transaction Blockchain

### Purpose
The foundation layer provides a novel blockchain with built-in transaction reversibility, enabling safe and recoverable financial operations.

### Key Components

#### Pending Transfer Engine
- Transactions remain in pending state until confirmed
- Configurable hold periods (3 minutes to 24 hours)
- Automatic finalization or return based on timeout rules

#### Cancellation Logic
- Sender can cancel before recipient confirms
- Small cancellation fees to prevent abuse
- Rate limiting on cancellation attempts

#### Guardian System
- Multi-signature approval for dispute resolution
- Freeze and recovery capabilities for fraud cases
- Decentralized guardian selection through staking

#### One-time Key (Passphrase) System
- Unique passphrase generated per transaction
- Recipient must return matching confirmation
- Prevents misdirected transfers and impersonation

### Technology Stack

#### Blockchain Framework Evaluation

We evaluated multiple blockchain frameworks for the Layer 1 implementation:

| Framework | Language | Consensus | Key Features | Evaluation |
|:--|:--|:--|:--|:--|
| **Cosmos SDK** | Go | CometBFT | IBC interoperability, modular | ⭐ Primary candidate |
| **Substrate** | Rust | BABE/GRANDPA | Forkless upgrades, flexible deployment | ⭐ Strong alternative |
| **OP Stack** | Solidity | Ethereum L2 | EVM compatible, proven | Fallback option |
| **Custom** | Julia/Rust | Custom | Full flexibility | High development cost |

---

#### Cosmos SDK Deep Dive

**Overview**

Cosmos SDK is a modular framework for building application-specific blockchains (appchains). It separates consensus (CometBFT) from application logic, allowing developers to focus on business logic.

**Key Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    Cosmos SDK Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Application Layer (Go)                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │  Modules │  │  Keeper  │  │   Store  │             │ │
│  │  │ (Custom) │  │ (State)  │  │  (IAVL)  │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘             │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  CometBFT (Consensus)                   │ │
│  │  - Byzantine Fault Tolerant                             │ │
│  │  - Instant finality (no block reorg)                    │ │
│  │  - ~1 second block time possible                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  IBC (Interoperability)                 │ │
│  │  - Cross-chain communication                            │ │
│  │  - Token transfers between Cosmos chains                │ │
│  │  - Message passing                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Case Study: dYdX Migration**

dYdX, a major decentralized derivatives exchange, migrated from Ethereum (StarkEx L2) to a dedicated Cosmos SDK chain:

| Aspect | Before (Ethereum) | After (Cosmos SDK) |
|:--|:--|:--|
| TPS | ~10-100 | ~10,000+ |
| Finality | Minutes (with rollup) | ~1 second |
| Customization | Limited by EVM | Full control |
| Fees | Variable, high | Predictable, low |
| Orderbook | Off-chain | On-chain (validators) |

**Relevance to Mouseion**: dYdX needed custom transaction logic (orderbook matching) that didn't fit EVM's model. Similarly, Mouseion's reversible transactions require custom state machine logic that Cosmos SDK enables.

**Pros for Mouseion**

1. **Instant Finality**: CometBFT provides immediate transaction finality, which is essential for reversible transactions (no risk of block reorganization undoing a "finalized" state)
2. **Custom Modules**: Can implement pending transfers, guardian system, and cancellation logic as native modules
3. **IBC Ready**: Future interoperability with other Cosmos chains (Osmosis for DEX, Noble for stablecoins, etc.)
4. **Mature Ecosystem**: Well-documented, large community, many production deployments

**Cons for Mouseion**

1. **Go Language**: Team may need to learn Go (though TypeScript prototyping helps)
2. **Validator Set**: Need to bootstrap initial validators
3. **No Forkless Upgrades**: Requires coordinated upgrades (though governance can help)

---

#### Substrate Deep Dive

**Overview**

Substrate is a modular blockchain framework developed by Parity Technologies. It provides extreme flexibility and a unique "forkless upgrade" capability.

**Key Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    Substrate Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Runtime (WebAssembly / Native)             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │ Pallets  │  │ FRAME    │  │  Storage │             │ │
│  │  │ (Custom) │  │(Framework)│  │  (Trie)  │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘             │ │
│  │                                                         │ │
│  │  ★ Runtime stored on-chain as WASM                     │ │
│  │  ★ Upgrades without hard forks!                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Consensus Options                      │ │
│  │  - BABE: Block production (probabilistic finality)      │ │
│  │  - GRANDPA: Finality gadget (deterministic finality)    │ │
│  │  - Aura: Simple round-robin (for testnets)              │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               Deployment Options                        │ │
│  │  ┌─────────────────┐    ┌─────────────────┐            │ │
│  │  │   Solo Chain    │    │   Parachain     │            │ │
│  │  │  (Independent)  │    │  (Polkadot)     │            │ │
│  │  └─────────────────┘    └─────────────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Solo Chain vs Parachain**

This is a critical architectural decision:

| Aspect | Solo Chain | Parachain |
|:--|:--|:--|
| **Independence** | Complete autonomy | Part of Polkadot ecosystem |
| **Security** | Own validator set | Shared security from Polkadot |
| **Interoperability** | Bridges only | Native XCMP with other parachains |
| **Cost** | Validator infrastructure | Parachain slot auction/lease |
| **Governance** | Fully independent | Subject to Polkadot governance |

**Important Clarification**: Mouseion using Substrate does NOT mean dependence on Polkadot, Astar, or any other chain. **Solo Chain** is a fully independent blockchain that simply uses Substrate as its framework. The relationship is similar to:
- Linux kernel → Ubuntu (uses Linux, but is independent)
- Ruby on Rails → Any Rails app (uses Rails, but is independent)

**Case Study: Astar Network**

Astar chose the Parachain model to gain:
- Shared security from Polkadot
- Native bridges to other parachains
- Access to Polkadot ecosystem

However, for Mouseion, **Solo Chain is recommended** because:
1. Full control over governance and tokenomics
2. No dependency on Polkadot slot auctions
3. Freedom to implement custom consensus parameters
4. Can still add bridges to other chains later

**Pros for Mouseion**

1. **Forkless Upgrades**: Runtime (business logic) stored on-chain as WASM; upgrades happen automatically without node software updates
2. **Rust Safety**: Memory-safe language reduces bugs in financial code
3. **FRAME Pallets**: Pre-built modules for common functionality (balances, governance, staking)
4. **Solo Chain Freedom**: Complete independence with no external dependencies

**Cons for Mouseion**

1. **Rust Complexity**: Steeper learning curve than Go
2. **GRANDPA Finality**: Not instant (~12-30 seconds for finality gadget), though blocks are produced every 6 seconds
3. **Smaller Ecosystem**: Fewer production deployments than Cosmos

---

#### Framework Comparison Matrix

| Feature | Cosmos SDK | Substrate (Solo Chain) |
|:--|:--|:--|
| **Language** | Go | Rust |
| **Finality Time** | ~1 second (instant) | ~12-30 seconds |
| **Upgrade Method** | Coordinated hard fork | Forkless (WASM) |
| **Interoperability** | IBC (Cosmos ecosystem) | Bridges (custom) |
| **Independence** | Full | Full |
| **Custom Logic** | Modules (Go) | Pallets (Rust) |
| **Ecosystem Size** | Large | Medium |
| **Learning Curve** | Moderate | Steep |
| **Reversible Tx Fit** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

#### Recommendation for Mouseion

**Primary: Cosmos SDK**

The instant finality of CometBFT is a critical advantage for reversible transactions. When a transaction moves to FINALIZED state, it must be truly final with no possibility of chain reorganization. Cosmos SDK provides this guarantee.

**Alternative: Substrate Solo Chain**

If the team has Rust expertise or values forkless upgrades highly, Substrate Solo Chain is a viable alternative. The ~12-30 second finality is acceptable for most use cases, though it creates a slightly longer window of uncertainty.

**Decision Factors**

| If you value... | Choose |
|:--|:--|
| Instant finality | Cosmos SDK |
| Forkless upgrades | Substrate |
| Larger ecosystem/docs | Cosmos SDK |
| Memory safety (Rust) | Substrate |
| IBC interoperability | Cosmos SDK |
| Complete independence | Either (both support) |

#### Hybrid Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Mouseion Stack                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌───────────────────────────┐  │
│  │  Julia Services │    │  Blockchain Core          │  │
│  │                 │    │  (Cosmos SDK / Substrate) │  │
│  │  - Contribution │───►│                           │  │
│  │    Calculation  │    │  - Reversible Transfers   │  │
│  │  - Similarity   │    │  - Guardian System        │  │
│  │    Analysis     │    │  - Staking & Governance   │  │
│  │  - Optimization │    │                           │  │
│  └─────────────────┘    └─────────────┬─────────────┘  │
│                                       │                 │
│                                       ▼                 │
│                         ┌───────────────────────────┐  │
│                         │  Settlement Layer         │  │
│                         │  (Optional: Ethereum L1)  │  │
│                         │  - Large settlements      │  │
│                         │  - Cross-chain bridges    │  │
│                         └───────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Technology Choices

- **Core Blockchain**: Cosmos SDK (Go) or Substrate (Rust)
- **Computation Layer**: Julia (scientific computing, royalty calculations)
- **Prototype**: TypeScript (rapid development, testing)
- **Consensus**: CometBFT (instant finality) or GRANDPA
- **Block Time**: Target 1-2 seconds

## Service Layer: AI Royalty Distribution

### Contribution Tracking Module

```
┌─────────────────────────────────────────┐
│         Contribution Tracker            │
├─────────────────────────────────────────┤
│  Input Analysis                         │
│  ├── Semantic Similarity (BERT)         │
│  ├── Keyword Matching (TF-IDF)          │
│  └── Pattern Recognition (Clustering)  │
├─────────────────────────────────────────┤
│  Attribution Engine                     │
│  ├── RAG-based Reference Tracking       │
│  ├── Attention Weight Analysis          │
│  └── Influence Function Estimation      │
├─────────────────────────────────────────┤
│  Contribution Score Calculator          │
│  ├── Usage Frequency                    │
│  ├── Quality Score                      │
│  ├── Similarity Score                   │
│  └── Rarity Factor                      │
└─────────────────────────────────────────┘
```

### Reward Distribution Module

```
┌─────────────────────────────────────────┐
│         Reward Distributor              │
├─────────────────────────────────────────┤
│  Pool Management                        │
│  ├── Fee Collection                     │
│  ├── Token Allocation                   │
│  └── Reserve Management                 │
├─────────────────────────────────────────┤
│  Distribution Engine                    │
│  ├── Contribution Aggregation           │
│  ├── Pro-rata Calculation               │
│  └── Pending Transfer Execution         │
├─────────────────────────────────────────┤
│  Verification                           │
│  ├── Double-spend Prevention            │
│  ├── Fraud Detection                    │
│  └── Audit Trail                        │
└─────────────────────────────────────────┘
```

### Data Management Module

```
┌─────────────────────────────────────────┐
│          Data Manager                   │
├─────────────────────────────────────────┤
│  Registration                           │
│  ├── Metadata Validation                │
│  ├── Hash Generation                    │
│  └── Permission Recording               │
├─────────────────────────────────────────┤
│  Storage Coordination                   │
│  ├── On-chain Metadata                  │
│  └── Off-chain Data (IPFS/Arweave)      │
├─────────────────────────────────────────┤
│  Human/AI Separation                    │
│  ├── Source Tagging                     │
│  ├── Separate Indexing                  │
│  └── Training Filters                   │
└─────────────────────────────────────────┘
```

### Expert Selection Module

```
┌─────────────────────────────────────────┐
│         Expert Selector                 │
├─────────────────────────────────────────┤
│  Classification Table                   │
│  ├── Academic Fields                    │
│  ├── Industry Sectors                   │
│  └── Specialty Tags                     │
├─────────────────────────────────────────┤
│  Candidate Scoring                      │
│  ├── Past Contributions                 │
│  ├── Evaluation History                 │
│  └── Expertise Score                    │
├─────────────────────────────────────────┤
│  Selection Algorithm                    │
│  ├── AI-based Matching                  │
│  └── Community Voting                   │
└─────────────────────────────────────────┘
```

### Annotation & Peer Review System

This section details the complete annotation workflow, from data submission to quality-assured annotation completion.

#### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                 ANNOTATION & PEER REVIEW SYSTEM                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │Classification│    │   Expert    │    │   Expert    │             │
│  │    Table    │───►│  Matching   │───►│  Assignment │             │
│  │  Registry   │    │   Engine    │    │   Queue     │             │
│  └─────────────┘    └─────────────┘    └──────┬──────┘             │
│                                               │                     │
│                                               ▼                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │  Quality    │◄───│    Peer     │◄───│ Annotation  │             │
│  │   Score     │    │   Review    │    │  Workspace  │             │
│  │ Calculator  │    │   Engine    │    │             │             │
│  └──────┬──────┘    └─────────────┘    └─────────────┘             │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐    ┌─────────────┐                                │
│  │ Reputation  │───►│   Reward    │                                │
│  │   Tracker   │    │ Distribution│                                │
│  └─────────────┘    └─────────────┘                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Complete Annotation Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│                      ANNOTATION WORKFLOW                           │
└────────────────────────────────────────────────────────────────────┘

1. REQUEST PHASE
   ┌──────────┐     ┌──────────────┐     ┌──────────────┐
   │   Data   │────►│   Classify   │────►│   Create     │
   │  Submit  │     │   by Field   │     │   Request    │
   └──────────┘     └──────────────┘     └──────┬───────┘
                                                │
2. MATCHING PHASE                               ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │    Query     │────►│    Score     │────►│   Select     │
   │Classification│     │  Candidates  │     │   Top N      │
   │    Table     │     │              │     │   Experts    │
   └──────────────┘     └──────────────┘     └──────┬───────┘
                                                    │
3. ANNOTATION PHASE                                 ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │   Notify     │────►│   Expert     │────►│    Submit    │
   │   Experts    │     │  Annotates   │     │  Annotation  │
   └──────────────┘     └──────────────┘     └──────┬───────┘
                                                    │
4. PEER REVIEW PHASE                                ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │   Assign     │────►│    Peer      │────►│   Calculate  │
   │   Reviewers  │     │   Reviews    │     │  Agreement   │
   └──────────────┘     └──────────────┘     └──────┬───────┘
                                                    │
5. FINALIZATION PHASE                               ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │   Compute    │────►│   Update     │────►│  Distribute  │
   │   Quality    │     │  Reputation  │     │   Rewards    │
   │    Score     │     │              │     │              │
   └──────────────┘     └──────────────┘     └──────────────┘
```

#### Peer Review Mechanism

```
┌─────────────────────────────────────────┐
│         Peer Review Engine              │
├─────────────────────────────────────────┤
│  Review Assignment                      │
│  ├── Select 2-3 peer reviewers          │
│  ├── Different from original annotator  │
│  └── Similar expertise level            │
├─────────────────────────────────────────┤
│  Review Criteria                        │
│  ├── Accuracy (0-100)                   │
│  ├── Completeness (0-100)               │
│  ├── Consistency (0-100)                │
│  └── Timeliness (deadline compliance)   │
├─────────────────────────────────────────┤
│  Consensus Calculation                  │
│  ├── Agreement Rate                     │
│  ├── Weighted Average Score             │
│  └── Outlier Detection                  │
├─────────────────────────────────────────┤
│  Dispute Resolution                     │
│  ├── Third reviewer if disagreement     │
│  ├── Guardian escalation if needed      │
│  └── Final arbitration process          │
└─────────────────────────────────────────┘
```

#### Quality Score Calculation

```
Quality Score = (
    Accuracy × 0.35 +
    Completeness × 0.25 +
    Consistency × 0.25 +
    Timeliness × 0.15
) × Agreement_Modifier

Agreement_Modifier:
  - High agreement (>90%): 1.0
  - Medium agreement (70-90%): 0.9
  - Low agreement (<70%): 0.7 + re-review required
```

#### Expert Reputation System

```
┌─────────────────────────────────────────┐
│        Reputation Tracker               │
├─────────────────────────────────────────┤
│  Metrics Tracked                        │
│  ├── Lifetime annotations count         │
│  ├── Average quality score              │
│  ├── Peer review accuracy               │
│  ├── Response time average              │
│  └── Dispute rate                       │
├─────────────────────────────────────────┤
│  Reputation Score Formula               │
│  │                                      │
│  │  Rep = (AvgQuality × 0.4) +          │
│  │        (ReviewAccuracy × 0.3) +      │
│  │        (Reliability × 0.2) +         │
│  │        (Experience × 0.1)            │
│  │                                      │
├─────────────────────────────────────────┤
│  Reputation Effects                     │
│  ├── Higher priority in matching        │
│  ├── Higher reward multiplier           │
│  ├── Eligibility for complex tasks      │
│  └── Governance weight bonus            │
└─────────────────────────────────────────┘
```

#### Classification Table Management

```
┌─────────────────────────────────────────┐
│     Classification Table Registry       │
├─────────────────────────────────────────┤
│  Structure                              │
│  ├── Level 1: Major Fields (CS, MED...) │
│  ├── Level 2: Subfields                 │
│  ├── Level 3: Specialties               │
│  └── Tags: Cross-cutting skills         │
├─────────────────────────────────────────┤
│  Governance                             │
│  ├── Community proposals for new fields │
│  ├── Voting on structure changes        │
│  ├── Expert committee review            │
│  └── Version control of table           │
├─────────────────────────────────────────┤
│  Expert Registration                    │
│  ├── Self-declared expertise            │
│  ├── Credential verification (optional) │
│  ├── Test annotation for validation     │
│  └── Community endorsement              │
└─────────────────────────────────────────┘
```

### Governance Module

```
┌─────────────────────────────────────────┐
│        Governance Engine                │
├─────────────────────────────────────────┤
│  Proposal Management                    │
│  ├── Submission                         │
│  ├── Discussion Period                  │
│  └── Voting Period                      │
├─────────────────────────────────────────┤
│  Voting Mechanisms                      │
│  ├── Simple Majority                    │
│  ├── Quadratic Voting                   │
│  └── Delegated Voting                   │
├─────────────────────────────────────────┤
│  Execution                              │
│  ├── Parameter Updates                  │
│  ├── System Upgrades                    │
│  └── Asset Management                   │
└─────────────────────────────────────────┘
```

## Application Layer

### Wallet UX Philosophy

#### Problems with Traditional Crypto Wallets (e.g., MetaMask)

| Issue | Traditional Approach | Problem |
|:--|:--|:--|
| **Seed Phrase** | 12-24 word backup | Users lose it, write it insecurely |
| **Gas Fees** | Manual estimation | Confusing for non-technical users |
| **Addresses** | 0x742d35Cc... | Not human-readable |
| **Signing** | Raw transaction data | Scary, hard to verify |
| **Recovery** | Seed phrase only | Lost = funds gone forever |
| **Networks** | Manual RPC configuration | Error-prone |

#### Mouseion Wallet Design Principles

```
┌─────────────────────────────────────────────────────────┐
│              Mouseion Wallet Vision                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. AUTHENTICATION (No Seed Phrases)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Primary: Passkey (Face ID / Fingerprint)         │ │
│  │  Backup:  Email + SMS verification                │ │
│  │  Recovery: Social recovery (trusted contacts)     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  2. TRANSACTIONS (Human-Friendly)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Recipient: @username or QR code (no hex address) │ │
│  │  Amount: Fiat display (¥1,000 → internal tokens)  │ │
│  │  Gas: Invisible (sponsored or included in fee)    │ │
│  │  Status: "Cancelable for 1 hour" (clear feedback) │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  3. SAFETY (Reversible by Design)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Grace period: Sender can cancel before confirm   │ │
│  │  Limits: Daily/weekly transfer caps               │ │
│  │  Alerts: Suspicious activity notifications        │ │
│  │  Guardian: Dispute resolution for fraud           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  4. ROYALTIES (Passive Income)                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Auto-receive: No claim transactions needed       │ │
│  │  Dashboard: "This month: ¥3,240 from 5 AI models" │ │
│  │  Withdraw: Bank transfer or external wallet       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Technical Implementation

```
┌─────────────────────────────────────────────────────────┐
│              Wallet Technical Stack                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Account Abstraction                                    │
│  ├── Smart contract wallets (not EOA)                  │
│  ├── Flexible signature verification                   │
│  ├── Gas sponsorship (Paymaster)                       │
│  └── Batch transactions                                │
│                                                         │
│  Authentication Options                                 │
│  ├── WebAuthn / Passkeys (FIDO2)                       │
│  ├── Email magic links                                 │
│  ├── Social login (OAuth) with MPC                     │
│  └── Hardware security modules (optional)              │
│                                                         │
│  Key Management                                         │
│  ├── MPC (Multi-Party Computation) for key sharding   │
│  ├── TEE (Trusted Execution Environment) where avail  │
│  └── Social recovery with threshold signatures        │
│                                                         │
│  User Experience                                        │
│  ├── ENS-like naming system (@username)                │
│  ├── Fiat on/off ramps integration                     │
│  ├── Push notifications for pending transfers          │
│  └── Mobile-first progressive web app                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Competitive Advantage: Reversible Transactions

Traditional crypto's biggest UX problem is **irreversibility**:
- Send to wrong address → Funds lost forever
- Scam transaction → No recourse
- New users → Too afraid to try

Mouseion's reversible transactions solve this:
- Mistakes are recoverable (cancel within grace period)
- Fraud can be frozen and reversed (Guardian system)
- New users can transact with confidence

**This is our core UX differentiator.**

### Wallet UI Features
- Token management with fiat conversion display
- Transaction history with clear status indicators
- Pending transfer confirmation with one-tap actions
- One-time key sharing via QR code or messaging
- Royalty earnings dashboard with attribution details

### UX Patterns from Modern Payment Apps

Analysis of successful mobile payment applications reveals common patterns:

| Pattern | Description | Mouseion Application |
|:--|:--|:--|
| **No complex addresses** | Phone number, username, QR code | @username, QR, phone number |
| **Instant feedback** | Sound, animation, immediate history update | Same + status progress bar |
| **Context integration** | Embedded in chat, social features | Messaging integration, notes |
| **Zero jargon** | No technical terms | No "gas", "signature", "block" |
| **Minimal taps** | 2-3 taps to complete | Same target |
| **Quick amounts** | Preset amount buttons | ¥500, ¥1K, ¥3K, ¥5K shortcuts |

### Transfer Flow Design

```
┌─────────────────────────────────────────────────────────┐
│                MOUSEION TRANSFER FLOW                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: Select Recipient                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  🔍 Search by name, @ID, or phone number          │ │
│  │                                                    │ │
│  │  Recent: [Avatar] [Avatar] [Avatar] [+]           │ │
│  │                                                    │ │
│  │  [ Scan QR Code ]                                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Step 2: Enter Amount                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │              ¥ 1,000                              │ │
│  │                                                    │ │
│  │  [¥500] [¥1K] [¥3K] [¥5K]  ← Quick select        │ │
│  │                                                    │ │
│  │  Note: Lunch 🍜                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Step 3: Confirm & Send                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Send ¥1,000 to @tanaka                           │ │
│  │                                                    │ │
│  │  ⚡ Cancelable for 1 hour                         │ │
│  │                                                    │ │
│  │           [ Send 👆 ]                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Step 4: Completion                                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │           ✨ Sent! ✨                              │ │
│  │                                                    │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  ⏱ Cancelable until 15:30                   │ │ │
│  │  │     [ Cancel Transfer ]                     │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Reversibility Visualization

Unlike traditional payment apps where transfers are instant and irreversible, Mouseion shows the reversibility window clearly:

```
┌─────────────────────────────────────────────────────────┐
│              TRANSFER STATUS INDICATOR                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Traditional Apps:                                      │
│    Sent → Done (no recourse)                           │
│                                                         │
│  Mouseion:                                              │
│    ●━━━━━━━━━━━━━○━━━━━━━━━━━━━○                        │
│   Sent        Pending         Finalized                │
│               ↑                                         │
│         [Cancel] available here                        │
│                                                         │
│  Status Messages:                                       │
│  - "Cancelable for 45 more minutes"                    │
│  - "Waiting for recipient confirmation"                │
│  - "Transfer complete"                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Royalty Dashboard Design

```
┌─────────────────────────────────────────────────────────┐
│                 ROYALTY DASHBOARD                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  This Month's Earnings                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │           ¥ 12,450                                │ │
│  │           +¥2,300 from last month ↑               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Breakdown by AI Model                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │  🤖 Text Generation    ¥5,200  ████████░░░ 42%    │ │
│  │  🎨 Image Generation   ¥3,800  ██████░░░░░ 31%    │ │
│  │  🎵 Music Generation   ¥2,100  ████░░░░░░░ 17%    │ │
│  │  📊 Other              ¥1,350  ██░░░░░░░░░ 10%    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Recent Activity                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │  2/15  Training usage (Text Gen)      +¥120       │ │
│  │  2/15  Reference usage (Image Gen)    +¥85        │ │
│  │  2/14  Training usage (Text Gen)      +¥95        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  [ Withdraw 💰 ]  [ Add Data 📁 ]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Registry
- Data upload and metadata entry
- Permission settings (opt-in/opt-out)
- Usage tracking dashboard

### Data Permission System

#### Design Philosophy

The permission system must balance three concerns:
1. **Simplicity**: Non-technical users can set permissions easily
2. **Granularity**: Power users can fine-tune exactly which AI uses their data
3. **Extensibility**: New AI model types (including multimodal) can be added

#### Data Type Detection & Auto-Filtering

The system automatically detects data types and filters irrelevant AI model options:

```
┌─────────────────────────────────────────────────────────┐
│              DATA TYPE → AI COMPATIBILITY               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Detected: Image Data                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ✅ Compatible AI Types (shown to user)            │ │
│  │  ├── Image Generation                              │ │
│  │  ├── Image Recognition / Classification            │ │
│  │  ├── Object Detection                              │ │
│  │  ├── Image Enhancement                             │ │
│  │  ├── Video Generation (as frames)                  │ │
│  │  └── Multimodal Understanding                      │ │
│  │                                                    │ │
│  │  ❌ Incompatible (hidden automatically)            │ │
│  │  ├── Text-to-Text Translation                      │ │
│  │  ├── Speech Recognition                            │ │
│  │  └── Time Series Prediction                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Multimodal AI Considerations

Modern AI increasingly uses multiple data types together. The permission system handles this through **usage roles**:

```
┌─────────────────────────────────────────────────────────┐
│              MULTIMODAL USAGE ROLES                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  A single dataset may be used in different roles:       │
│                                                         │
│  Text Data Example:                                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Role: PRIMARY                                     │ │
│  │  └── Text Generation AI (direct training)          │ │
│  │                                                    │ │
│  │  Role: AUXILIARY                                   │ │
│  │  ├── Image Generation AI (as prompts/captions)     │ │
│  │  ├── Audio Generation AI (as transcripts)          │ │
│  │  └── Multimodal AI (text encoder training)         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Image Data Example:                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Role: PRIMARY                                     │ │
│  │  ├── Image Generation AI (direct training)         │ │
│  │  └── Image Recognition AI (direct training)        │ │
│  │                                                    │ │
│  │  Role: AUXILIARY                                   │ │
│  │  ├── Text Generation AI (vision encoder)           │ │
│  │  ├── Video Generation AI (as keyframes)            │ │
│  │  └── Multimodal AI (image encoder training)        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Permission Schema (Extensible Design)

```json
{
  "schema_version": "1.0",
  "data_type": {
    "primary": "image",
    "subtypes": ["photograph", "illustration"],
    "detected_features": ["contains_faces", "outdoor_scene"]
  },

  "permissions": {
    "model_categories": {
      "generative": {
        "image": { "allowed": true, "role": "primary" },
        "video": { "allowed": true, "role": "auxiliary" },
        "text":  { "allowed": false },
        "audio": { "allowed": false }
      },
      "recognition": {
        "classification": { "allowed": true },
        "detection": { "allowed": true },
        "segmentation": { "allowed": true }
      },
      "multimodal": {
        "vision_language": { "allowed": true, "role": "primary" },
        "any_to_any": { "allowed": true, "role": "auxiliary" }
      },
      "transformation": {
        "enhancement": { "allowed": true },
        "style_transfer": { "allowed": true }
      }
    },

    "training_phases": {
      "pretraining": true,
      "finetuning": true,
      "rlhf": true,
      "rag_retrieval": true,
      "evaluation": true
    },

    "usage_context": {
      "commercial": true,
      "research": true,
      "educational": true
    },

    "special_conditions": {
      "face_usage": "blur_required",
      "attribution": "not_required",
      "geographic_restriction": null,
      "expiry_date": null
    }
  },

  "_extensibility": {
    "custom_model_types": [],
    "custom_conditions": [],
    "future_compatibility": "unknown_types_default_to_deny"
  }
}
```

#### UI Flow: Progressive Disclosure

```
┌─────────────────────────────────────────────────────────┐
│           DATA PERMISSION UI - LEVEL 1 (Simple)         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 Uploaded: vacation_photos.zip (2,450 images)        │
│  📷 Detected: Photograph images with people             │
│                                                         │
│  How would you like AI to use this data?                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ◉ Open (Recommended)                              │ │
│  │    Allow all compatible AI development             │ │
│  │    → Maximum royalty potential                     │ │
│  │                                                    │ │
│  │  ○ Balanced                                        │ │
│  │    Allow most AI, exclude face-related             │ │
│  │                                                    │ │
│  │  ○ Conservative                                    │ │
│  │    Research and non-commercial only                │ │
│  │                                                    │ │
│  │  ○ Custom                                          │ │
│  │    Choose specific AI types and conditions         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  [ Register Data ]                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           DATA PERMISSION UI - LEVEL 2 (Custom)         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Which AI types may use your images?                    │
│                                                         │
│  Creating AI                                            │
│  ├── ☑ AI that creates images (primary use)            │
│  ├── ☑ AI that creates videos (as reference frames)    │
│  └── ☐ AI that creates text (for vision training)      │
│                                                         │
│  Understanding AI                                       │
│  ├── ☑ AI that recognizes image contents               │
│  ├── ☑ AI that finds objects in images                 │
│  └── ☑ AI that answers questions about images          │
│                                                         │
│  Enhancing AI                                           │
│  ├── ☑ AI that improves image quality                  │
│  └── ☑ AI that changes image style                     │
│                                                         │
│  [ Advanced Settings ▼ ]                                │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           DATA PERMISSION UI - LEVEL 3 (Advanced)       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Training Phase Permissions                             │
│  ├── ☑ Foundation model training (large-scale)         │
│  ├── ☑ Task-specific fine-tuning                       │
│  ├── ☑ Human feedback training (RLHF)                  │
│  ├── ☑ Retrieval reference (RAG, not trained)          │
│  └── ☑ Model evaluation/benchmarking                   │
│                                                         │
│  Special Conditions                                     │
│  ├── Faces detected in images:                         │
│  │   ○ Allow as-is  ◉ Require blur  ○ Deny usage       │
│  ├── Commercial use:                                   │
│  │   ◉ Allow  ○ Non-commercial only                    │
│  └── Attribution:                                      │
│      ○ Required  ◉ Not required                        │
│                                                         │
│  [ View as JSON ]  [ Save Preset ]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Extensibility for Future AI Types

The system is designed to accommodate new AI paradigms:

```
┌─────────────────────────────────────────────────────────┐
│              EXTENSIBILITY MECHANISMS                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Model Category Registry (Governance-managed)        │
│  ┌────────────────────────────────────────────────────┐ │
│  │  New AI type proposal → Community vote → Add       │ │
│  │                                                    │ │
│  │  Example additions:                                │ │
│  │  - "world_model" (2025)                            │ │
│  │  - "embodied_ai" (robotics)                        │ │
│  │  - "scientific_discovery" (AlphaFold-like)         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  2. Default Behavior for Unknown Types                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │  User chooses default stance:                      │ │
│  │  ○ Optimistic: Allow unknown types (opt-out)       │ │
│  │  ◉ Conservative: Deny unknown types (opt-in)       │ │
│  │                                                    │ │
│  │  When new type added, user is notified to review   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  3. Compatibility Inference Engine                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  New AI type inherits permissions from similar     │ │
│  │  existing types until user explicitly sets         │ │
│  │                                                    │ │
│  │  Example: "world_model" → inherits from            │ │
│  │           "video_generation" + "multimodal"        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Data Type Compatibility Matrix

| Data Type | Primary AI Uses | Auxiliary AI Uses |
|:--|:--|:--|
| **Image** | Image gen, Recognition, Enhancement | Video gen, Vision-Language, World models |
| **Text** | Text gen, Translation, Summarization | Image gen (captions), Audio gen (scripts), Multimodal |
| **Audio** | Speech recognition, Music gen, TTS | Video gen (soundtrack), Multimodal understanding |
| **Video** | Video gen, Action recognition | Image gen (frames), Audio gen, World models |
| **Structured** | Prediction, Anomaly detection, Recommendation | LLM (table understanding), Multimodal analytics |
| **Code** | Code gen, Bug detection | Text gen (documentation), Multimodal (code + output) |
| **3D/CAD** | 3D generation, Simulation | Image gen (renders), Video gen, Robotics |

### Reward Dashboard
- Earnings visualization
- Contribution breakdown
- Payout history

### Governance Voting
- Proposal browsing
- Voting interface
- Delegation management

### Expert Portal
- Annotation workspace
- Peer review interface
- Expertise profile management

### Marketplace
- Data discovery
- License purchasing
- Direct sales

### Model Registry & Distribution

Mouseion tracks not only data contributions but also the models trained on that data, enabling royalty distribution based on actual model usage.

#### Model Lifecycle on Mouseion

```
┌─────────────────────────────────────────────────────────────┐
│                  MODEL LIFECYCLE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DATA REGISTRATION                                        │
│  ┌─────────────┐                                            │
│  │Data Provider│ → Register data → Set permissions          │
│  └─────────────┘                                            │
│                                                              │
│  2. LICENSING (Training Phase)                               │
│  ┌─────────────┐    ┌─────────────┐                         │
│  │AI Developer │ →  │ License data│ → Pay licensing fee     │
│  │             │    │via Mouseion │                         │
│  └─────────────┘    └─────────────┘                         │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Training happens EXTERNALLY (DePIN / Cloud)        │    │
│  │  - Mouseion records which datasets were used        │    │
│  │  - Mouseion does NOT perform computation            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  3. MODEL REGISTRATION                                       │
│  ┌─────────────┐    ┌─────────────┐                         │
│  │AI Developer │ →  │Register     │ → Model metadata        │
│  │             │    │trained model│ → Data usage proof      │
│  └─────────────┘    └─────────────┘ → Weights or API URL    │
│                                                              │
│  4. MODEL ACCESS (Inference Phase)                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ End User    │ →  │Request      │ →  │ Use model   │     │
│  │             │    │API key or   │    │ (inference) │     │
│  │             │    │weight access│    │             │     │
│  └─────────────┘    └──────┬──────┘    └─────────────┘     │
│                            │                                 │
│  5. ROYALTY DISTRIBUTION   ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Usage tracked → Fees collected → Royalties paid    │    │
│  │  (via reversible transactions)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Model Marketplace UI

```
┌─────────────────────────────────────────────────────────────┐
│                    MODEL MARKETPLACE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search: [image generation___________] [Search]           │
│                                                              │
│  Filter: [All Types ▼] [Commercial OK ▼] [Sort: Popular ▼]  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🤖 ImageGen-v3                              ⭐ 4.8     │ │
│  │  ──────────────────────────────────────────────────────│ │
│  │  Developer: @acme_ai                                   │ │
│  │  Training data: 2,450,000 items                        │ │
│  │  Your contribution: 120 items (0.005%)                 │ │
│  │  License: Commercial use allowed                       │ │
│  │                                                        │ │
│  │  Access Options:                                       │ │
│  │  ┌──────────────────┐  ┌──────────────────┐           │ │
│  │  │  🔑 API Access   │  │  📦 Weight DL    │           │ │
│  │  │  ¥0.10 / call    │  │  ¥50,000 (1x)    │           │ │
│  │  │                  │  │                  │           │ │
│  │  │  [Get API Key]   │  │  [Download]      │           │ │
│  │  └──────────────────┘  └──────────────────┘           │ │
│  │                                                        │ │
│  │  💰 Your royalty: ¥0.001/API call, ¥50/download        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🎵 MusicGen-Pro                             ⭐ 4.5     │ │
│  │  ──────────────────────────────────────────────────────│ │
│  │  Developer: @sound_labs                                │ │
│  │  Training data: 890,000 items                          │ │
│  │  Your contribution: 0 items                            │ │
│  │  ...                                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Model Access Methods

| Method | Description | Use Case |
|:--|:--|:--|
| **API Key** | Per-call access via Mouseion gateway | SaaS integration, pay-per-use |
| **Weight Download** | One-time purchase of model weights | Self-hosting, fine-tuning |
| **Subscription** | Monthly unlimited access | Enterprise users |
| **Research License** | Free/reduced for academic use | Universities, nonprofits |

#### API Gateway Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 MOUSEION API GATEWAY                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  End User Request                                            │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────┐                                            │
│  │ Mouseion    │  1. Validate API key                       │
│  │ Gateway     │  2. Check quota/balance                    │
│  │             │  3. Log usage (on-chain or batched)        │
│  └──────┬──────┘                                            │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ AI Dev's    │  ← Actual inference happens here           │
│  │ Endpoint    │  ← Mouseion does NOT host models           │
│  │ (External)  │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│         ▼                                                    │
│  Response returned to user                                   │
│                                                              │
│  ───────────────────────────────────────────────────────── │
│                                                              │
│  Periodically (e.g., daily):                                │
│  ┌─────────────┐    ┌─────────────┐                         │
│  │ Aggregate   │ →  │ Distribute  │ → Data providers        │
│  │ usage logs  │    │ royalties   │   receive payment       │
│  └─────────────┘    └─────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Decision**: Mouseion acts as a **lightweight gateway**, not a model hosting service. This minimizes infrastructure costs while maintaining usage tracking.

## Data Flow

### Data Registration Flow
```
User → Data Registry UI → Data Manager → On-chain (metadata) + Off-chain (body)
```

### AI Generation Flow
```
AI Service → Contribution Tracker → Attribution → Reward Distribution → Pending Transfer
```

### Reward Claim Flow
```
Contributor → Wallet UI → Confirm Receipt → Layer 1 (Finalize) → Token Transfer
```

### Governance Flow
```
Proposal → Discussion → Voting → Execution (if passed)
```

## External Integrations

### Off-chain Storage
- **IPFS**: Distributed file storage
- **Arweave**: Permanent storage option

### AI Services
- API integration for contribution tracking
- Webhook notifications for reward triggers

### Identity (Optional)
- KYC providers for high-value operations
- Social recovery services

## Security Considerations

### Layer 1
- Atomic state transitions
- Cryptographic randomness for one-time keys
- Rate limiting on cancellations

### Service Layer
- Fraud detection algorithms
- Cross-review validation
- Audit logging

### Application Layer
- Secure key storage
- Phishing protection
- Domain verification

## Cost Structure & Funding Flow

### Who Pays for What?

A critical question: Who bears the costs in the Mouseion ecosystem?

```
┌─────────────────────────────────────────────────────────────┐
│                    FUNDING FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  AI Developer (Model Trainer)                                │
│       │                                                      │
│       ├──→ Compute costs ────────→ DePIN / Cloud providers  │
│       │    (GPU rental)            (Akash, AWS, etc.)        │
│       │                                                      │
│       └──→ Data licensing ───────→ Mouseion                  │
│            fees                         │                    │
│                                         ├──→ Data providers  │
│                                         │    (royalties)     │
│                                         │                    │
│                                         └──→ Mouseion        │
│                                              (platform fee)  │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Model User (Inference)                                      │
│       │                                                      │
│       └──→ API / Download ───────→ Mouseion                  │
│            fees                         │                    │
│                                         ├──→ AI Developer    │
│                                         │    (model creator) │
│                                         │                    │
│                                         ├──→ Data providers  │
│                                         │    (usage royalty) │
│                                         │                    │
│                                         └──→ Mouseion        │
│                                              (platform fee)  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Cost Breakdown by Role

| Role | Pays | Receives |
|:--|:--|:--|
| **Data Provider** | Nothing | Royalties from training + inference |
| **AI Developer** | Compute + Data licensing | Revenue from model usage |
| **Model User** | API/Download fees | Access to trained models |
| **Mouseion** | Infrastructure (minimal) | Platform fees (% of transactions) |

### Mouseion Does NOT Pay For:

- ❌ GPU compute for training
- ❌ Model hosting/inference servers
- ❌ Data storage (uses IPFS/Arweave, paid by uploaders)

### Mouseion DOES Pay For:

- ✅ Blockchain node operation
- ✅ API gateway (lightweight relay)
- ✅ Web application hosting

### Revenue Model

```
┌─────────────────────────────────────────────────────────────┐
│                 MOUSEION REVENUE SOURCES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Data Licensing Fee (Training)                            │
│     └── AI Developer pays to use datasets                   │
│     └── Mouseion takes 5-10% platform fee                   │
│     └── Rest goes to data providers                         │
│                                                              │
│  2. Model Access Fee (Inference)                             │
│     └── Users pay per API call or download                  │
│     └── Mouseion takes 5-10% platform fee                   │
│     └── Split between AI dev and data providers             │
│                                                              │
│  3. Premium Features (Optional)                              │
│     └── Priority matching for experts                       │
│     └── Advanced analytics                                  │
│     └── Enterprise SLAs                                     │
│                                                              │
│  4. Token Economics (Future)                                 │
│     └── Staking rewards                                     │
│     └── Governance participation                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Example Transaction Flow

```
Scenario: AI company trains image model, user makes API call

1. TRAINING PHASE
   AI Dev licenses 1M images @ ¥0.10 each = ¥100,000
   ├── Data providers receive: ¥90,000 (90%)
   └── Mouseion receives: ¥10,000 (10%)

2. MODEL REGISTRATION
   AI Dev registers trained model (free, just metadata)

3. INFERENCE PHASE
   User makes 10,000 API calls @ ¥1 each = ¥10,000
   ├── AI Developer receives: ¥7,000 (70%)
   ├── Data providers receive: ¥2,000 (20%)
   └── Mouseion receives: ¥1,000 (10%)

Total data provider earnings: ¥92,000 for their images
```

### MVP Cost Optimization

For a lean launch, Mouseion can minimize infrastructure:

| Component | Full Version | MVP Version |
|:--|:--|:--|
| Model Hosting | Mouseion servers | AI Dev's servers (external URL) |
| API Gateway | Full proxy | Redirect + logging only |
| Usage Tracking | Real-time on-chain | Batched daily settlement |
| Model Weights | IPFS + redundancy | AI Dev provides download |

This keeps operational costs low while proving the core value proposition.

---

## Computing Resources for AI Training

### The Question: Can AI Training Be Distributed Like Blockchain?

A common misconception is that AI training computation can be distributed in the same way blockchain nodes share consensus work. In reality, these are fundamentally different computational paradigms.

**Blockchain Consensus vs AI Training**

| Aspect | Blockchain Consensus | AI Training |
|:--|:--|:--|
| Computation type | Hash calculation, validation | Matrix operations, gradients |
| Data dependency | Independent blocks | Highly interdependent data |
| Parallelization | Naturally parallel (each node validates) | Requires careful orchestration |
| Communication | Occasional (block broadcast) | Constant (gradient sync) |
| Latency tolerance | Minutes acceptable | Milliseconds matter |

### Mouseion's Role: Incentive Layer, Not Training Layer

**Critical Clarification**: Mouseion does NOT perform AI training itself. Mouseion is an **incentive and attribution layer** that:

1. **Tracks data contributions** to AI models
2. **Distributes royalties** to data providers
3. **Manages permissions** for data usage
4. **Provides governance** for the ecosystem

AI training happens **externally**—on centralized cloud (AWS, GCP), or increasingly, on decentralized compute networks.

```
┌─────────────────────────────────────────────────────────────┐
│                    Mouseion Ecosystem                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 Data Providers                          │ │
│  │  (Register data, set permissions, receive royalties)   │ │
│  └───────────────────────────┬────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Mouseion Blockchain (This Project)            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │Contribution│ │  Royalty │ │Permission│             │ │
│  │  │ Tracking  │  │  Distrib │ │  System  │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘             │ │
│  └───────────────────────────┬────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           External Compute (NOT part of Mouseion)       │ │
│  │                                                         │ │
│  │  Option A: Centralized Cloud                            │ │
│  │  ├── AWS, GCP, Azure                                    │ │
│  │  └── Traditional GPU clusters                           │ │
│  │                                                         │ │
│  │  Option B: Decentralized Compute Networks (DePIN)       │ │
│  │  ├── Akash Network (GPU marketplace)                    │ │
│  │  ├── Render Network (GPU rendering/AI)                  │ │
│  │  └── Bittensor (AI training network)                    │ │
│  │                                                         │ │
│  │  Option C: Federated Learning                           │ │
│  │  └── Train locally, share only model updates            │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Distributed AI Training Approaches

#### 1. Federated Learning (Most Privacy-Preserving)

Federated Learning enables model training without centralizing data:

```
┌─────────────────────────────────────────────────────────────┐
│                   Federated Learning Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐        │
│   │ Node A │   │ Node B │   │ Node C │   │ Node D │        │
│   │ (Data) │   │ (Data) │   │ (Data) │   │ (Data) │        │
│   └───┬────┘   └───┬────┘   └───┬────┘   └───┬────┘        │
│       │            │            │            │              │
│       ▼            ▼            ▼            ▼              │
│   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐        │
│   │ Local  │   │ Local  │   │ Local  │   │ Local  │        │
│   │Training│   │Training│   │Training│   │Training│        │
│   └───┬────┘   └───┬────┘   └───┬────┘   └───┬────┘        │
│       │            │            │            │              │
│       └────────────┴─────┬──────┴────────────┘              │
│                          │                                   │
│                          ▼ (Only gradients, NOT raw data)   │
│                   ┌─────────────┐                           │
│                   │  Aggregate  │                           │
│                   │   Updates   │                           │
│                   └──────┬──────┘                           │
│                          │                                   │
│                          ▼                                   │
│                   ┌─────────────┐                           │
│                   │   Global    │                           │
│                   │   Model     │                           │
│                   └─────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Pros**:
- Data never leaves user devices
- Privacy-preserving by design
- Scales well for edge devices

**Cons**:
- Higher communication overhead
- Model quality depends on data distribution
- Harder to coordinate for large models (LLMs)

**Mouseion Integration**: Mouseion can track which nodes participated in federated training and distribute royalties based on contribution metrics (gradient updates, data quality scores).

#### 2. Decentralized Compute Networks (DePIN)

Major players in 2025-2026:

| Network | Focus | Key Features |
|:--|:--|:--|
| **Akash Network** | General cloud compute | Kubernetes-based, $4.3M ARR, integrating NVIDIA Blackwell GPUs |
| **Render Network** | GPU rendering + AI | 300,000+ GPUs, expanding to AI workloads |
| **Bittensor (TAO)** | AI training/inference | Subnet architecture, dTAO market-driven allocation |
| **AIArena** | Decentralized AI training | 600+ training nodes, 19,000+ models generated |

**How DePIN Works**:

```
┌─────────────────────────────────────────────────────────────┐
│                   DePIN Compute Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Compute Providers (GPU owners)                             │
│   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐        │
│   │ RTX 4090│   │ A100   │   │ H100   │   │ A6000  │        │
│   └───┬────┘   └───┬────┘   └───┬────┘   └───┬────┘        │
│       │            │            │            │              │
│       └────────────┴─────┬──────┴────────────┘              │
│                          │                                   │
│                          ▼                                   │
│                   ┌─────────────┐                           │
│                   │ Marketplace │  ← Akash, Render, etc.    │
│                   │ (Matching)  │                           │
│                   └──────┬──────┘                           │
│                          │                                   │
│                          ▼                                   │
│                   ┌─────────────┐                           │
│                   │   AI Dev    │  ← Rents compute          │
│                   │  (Buyer)    │  ← Pays in tokens         │
│                   └─────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Mouseion Integration**: When AI developers train models using DePIN compute, Mouseion tracks which datasets were used and ensures data providers are compensated. The compute marketplace and royalty distribution are separate but complementary.

#### 3. Hybrid Approach (Recommended for Mouseion Ecosystem)

```
┌─────────────────────────────────────────────────────────────┐
│                Mouseion + DePIN Integration                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Data Provider registers data on Mouseion                │
│     └── Sets permissions, pricing, AI type restrictions     │
│                                                              │
│  2. AI Developer queries Mouseion for licensed data         │
│     └── Mouseion returns eligible datasets + license terms  │
│                                                              │
│  3. AI Developer rents compute from DePIN                   │
│     └── Akash/Render/Bittensor provides GPU compute         │
│                                                              │
│  4. Training happens on DePIN compute                       │
│     └── Model trained using licensed data                   │
│                                                              │
│  5. AI Developer reports usage to Mouseion                  │
│     └── Contribution metrics (which data, how much, etc.)   │
│                                                              │
│  6. Mouseion distributes royalties                          │
│     └── Data providers receive payment via reversible tx    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Summary: Mouseion's Compute Strategy

| Question | Answer |
|:--|:--|
| Does Mouseion do AI training? | **No** — Mouseion is an incentive/attribution layer |
| Where does training happen? | External compute (cloud or DePIN) |
| Can training be distributed? | Yes, via Federated Learning or DePIN |
| What does Mouseion blockchain do? | Tracks contributions, distributes royalties, manages permissions |
| Future integration? | Partner with DePIN networks for compute, focus on incentive layer |

### Market Context (2025-2026)

- Blockchain-AI market: $0.7B (2025) → projected $1.88B (2029)
- Federated Learning market: $150M (2023) → projected $2.3B (2032), 35.4% CAGR
- Akash Network ARR: $4.3M+, 27,000 new leases in Q3 2025
- AIArena: 600+ training nodes, 19,000+ models generated on-chain

Sources:
- [AIArena: ACM Web Conference 2025](https://dl.acm.org/doi/10.1145/3701716.3715484)
- [Akash Network Q3 2025 - Messari](https://messari.io/report/state-of-akash-q3-2025)
- [Decentralized Compute Networks - Guru Startups](https://www.gurustartups.com/reports/decentralized-compute-networks-akash-render-bittensor)
- [Blockchain-Based Federated Learning Survey - MDPI](https://www.mdpi.com/2076-3417/14/20/9459)
- [Federated Learning Market Growth 2025](https://vertu.com/ai-tools/ai-federated-learning-transforming-industries-2025/)

---

## Scalability Path

### Phase 1: Single Node (MVP)
- Basic ledger functionality
- Simple web wallet

### Phase 2: Multi-Node
- Distributed consensus
- Synchronization protocols

### Phase 3: Layer 2 (Future)
- Batch processing
- Off-chain computation
- State channels

### Phase 4: DePIN Integration (Future)
- Partner with decentralized compute networks
- Federated learning support for privacy-preserving training
- Cross-chain bridges to compute marketplaces
