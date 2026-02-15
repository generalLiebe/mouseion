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

### Technology
- **Language**: Julia
- **Consensus**: To be determined (likely PoS variant)
- **Block Time**: Target under 5 seconds

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

### Wallet UI
- Token management
- Transaction history
- Pending transfer confirmation
- One-time key generation/confirmation

### Data Registry
- Data upload and metadata entry
- Permission settings (opt-in/opt-out)
- Usage tracking dashboard

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
