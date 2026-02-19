# Mouseion Development Roadmap

## Overview

This roadmap outlines the phased development of the Mouseion protocol, from initial MVP to full ecosystem deployment. The roadmap integrates both technical development and business sustainability milestones.

For detailed monetization strategy, see [Monetization Strategy](./monetization.md).

---

## Phase 0: Survival & Validation (Now - 3 months)

**Focus**: Secure funding and build initial track record

### Business Milestones

- [ ] **B0.1** Grant Applications
  - Web3 ecosystem grants (Cosmos, Polkadot, Web3 Foundation)
  - AI ethics/safety grants
  - Regional grants (NEDO/JST for Japan)

- [ ] **B0.2** Initial B2B Contracts
  - 1-2 pilot contracts with AI startups or universities
  - Small-scale dataset licensing (1,000-10,000 items)
  - Data provenance proof service

- [ ] **B0.3** Consulting Revenue
  - Data provenance audits
  - Copyright compliance consultation

### Technical Milestones

- [x] **T0.1** Public Repository Setup ✅ *Completed 2024-02*
  - Documentation complete
  - Whitepaper published
  - Technical specifications available

- [x] **T0.2** Basic Prototype ✅ *Completed 2024-02*
  - Core blockchain proof-of-concept
  - Basic transaction flow demo
  - CLI tool with full transaction lifecycle

### Success Criteria
- Monthly revenue target: $5,000-$10,000
- At least 1 grant application submitted
- At least 1 pilot contract signed

---

## Phase 1: Foundation (MVP)

**Focus**: Core blockchain and basic functionality

### Milestones

- [x] **L1.1** Single-node reversible blockchain ✅ *Completed*
  - Basic ledger with pending/finalized states
  - Cancel functionality
  - Time-based auto-finalization
  - Guardian freeze/recover mechanism

- [x] **L1.2** Token issuance on base chain ✅ *Completed*
  - Native token implementation
  - Basic transfer functionality
  - Mint functionality for testing

- [ ] **L1.3** Data registration and metadata management
  - On-chain metadata storage
  - Hash-based verification
  - Permission flags (opt-in/opt-out)

- [ ] **L1.4** Simple reward distribution
  - Fixed-ratio distribution
  - Manual trigger mechanism

- [x] **L1.5** CLI Wallet ✅ *Completed*
  - Send/receive tokens
  - Pending transfer confirmation/cancellation
  - Transaction history
  - Interactive demo

### Deliverables
- [x] Local testnet (in-memory)
- [x] Basic documentation
- [x] CLI tool
- [ ] Persistent testnet deployment
- Developer setup guide

---

## Phase 2: Contribution Tracking

**Focus**: AI attribution and dynamic rewards

### Milestones

- [ ] **L2.1** Contributor identification algorithms
  - Semantic similarity (Sentence-BERT)
  - Keyword matching (TF-IDF)
  - RAG-based tracking

- [ ] **L2.2** Dynamic reward distribution
  - Contribution score calculation
  - Automated distribution triggers

- [ ] **L2.3** Annotation functionality
  - Basic annotation interface
  - Metadata tagging

- [ ] **L2.4** Expert evaluation system
  - Expert registration
  - Quality scoring
  - Cross-review mechanism

### Deliverables
- Contribution tracking API
- Expert portal (basic)
- Updated documentation

---

## Phase 3: Governance

**Focus**: Decentralized decision-making

### Milestones

- [ ] **L3.1** Voting functionality
  - Proposal submission
  - Simple majority voting
  - Result execution

- [ ] **L3.2** Proposal and discussion system
  - On-chain proposals
  - Off-chain discussion integration

- [ ] **L3.3** Delegated voting
  - Vote delegation mechanism
  - Delegation dashboard

- [ ] **L3.4** Guardian election
  - Staking requirements
  - Election process
  - Guardian responsibilities

- [ ] **L3.5** Quadratic voting
  - For major decisions
  - Whale protection implementation

### Deliverables
- Governance portal
- Guardian documentation
- Voting guide

---

## Phase 4: Ecosystem Expansion & B2B Scaling

**Focus**: Marketplace, integrations, and B2B revenue scaling

### Business Milestones

- [ ] **B4.1** B2B Data Licensing at Scale
  - 10+ enterprise customers
  - Tiered pricing (Research, Startup, Enterprise)
  - 80/20 revenue split (providers/platform)

- [ ] **B4.2** Partnership Development
  - Creator platform integrations
  - AI company partnerships
  - Academic institution agreements

### Technical Milestones

- [ ] **L4.1** Data marketplace
  - Data listing
  - Search and discovery
  - Purchase flow

- [ ] **L4.2** External AI service integration API
  - Contribution tracking hooks
  - Reward trigger webhooks
  - Standard integration docs

- [ ] **L4.3** Mobile wallet
  - iOS app
  - Android app
  - Core functionality

- [ ] **L4.4** Multi-language support
  - Japanese (primary)
  - English
  - Additional languages

### Deliverables
- Public marketplace
- API documentation
- Mobile apps
- Localized interfaces
- B2B licensing portal

---

## Phase 5: Advanced Features & Full Monetization

**Focus**: Scalability, advanced functionality, and complete revenue model

### Business Milestones

- [ ] **B5.1** Pay-per-Inference Implementation
  - Usage tracking per API call
  - Real-time royalty calculation
  - Automated distribution via reversible transactions

- [ ] **B5.2** Model Marketplace
  - Trained model listings
  - Model access fees
  - Version-specific pricing

- [ ] **B5.3** Token Launch (Optional)
  - Governance token issuance
  - Staking mechanisms
  - Token-based incentives

### Technical Milestones

- [ ] **L5.1** AI model version management
  - Version registry
  - Training data tracking
  - Change history

- [ ] **L5.2** Advanced contribution analysis
  - Influence Functions
  - Attention weight analysis
  - Multi-modal support

- [ ] **L5.3** Cross-chain compatibility
  - Bridge implementations
  - Asset portability

- [ ] **L5.4** Layer 2 scaling
  - Off-chain computation
  - Batch processing
  - State channels

- [ ] **L5.5** Human/AI data separation
  - Source verification
  - Separate indexing
  - Training filters

- [ ] **L5.6** Inference Gateway
  - API request routing
  - Usage metering
  - Billing integration

### Deliverables
- Scaled infrastructure
- Advanced analytics
- Cross-chain bridges
- Inference billing system
- Full revenue model operational

---

## Current Status

| Phase | Status | Progress |
|:--|:--|:--|
| Phase 0 | **In Progress** | T0.1 ✅, T0.2 ✅, B0.1-B0.3 Pending |
| Phase 1 | **In Progress** | L1.1 ✅, L1.2 ✅, L1.5 ✅, L1.3-L1.4 Pending |
| Phase 2 | Planned | - |
| Phase 3 | Planned | - |
| Phase 4 | Planned | - |
| Phase 5 | Planned | - |

### What's Completed

- ✅ Reversible transaction blockchain (core implementation)
- ✅ Transaction state machine (PENDING → FINALIZED/CANCELLED/FROZEN/RECOVERED)
- ✅ Wallet functionality with CLI
- ✅ Token minting and transfers
- ✅ Interactive demo
- ✅ 62 passing tests
- ✅ Documentation (whitepaper, specs, roadmap, monetization)
- ✅ Business development materials (pilot proposal, pricing, grant templates)

## Revenue Milestones

| Phase | Revenue Target | Source |
|:--|:--|:--|
| Phase 0 | $5K-$10K/month | Grants + Pilots |
| Phase 1-3 | $10K-$50K/month | B2B Licensing |
| Phase 4 | $50K-$200K/month | Marketplace Fees |
| Phase 5 | $200K+/month | Inference Billing |

## Key Dependencies

### Technical
- Production language selection (Rust or Go for performance-critical components)
- Off-chain storage selection
- AI attribution algorithm selection

### Business
- Grant funding secured
- Initial B2B customers
- Data provider network

### External
- Community formation
- Initial funding
- Partnership development

## Risk Factors

| Risk | Impact | Mitigation |
|:--|:--|:--|
| Resource constraints | High | Open-source collaboration |
| Technical complexity | Medium | Phased approach |
| Market timing | Medium | Focus on differentiation |
| Regulatory changes | Medium | Legal monitoring |

## How to Contribute

See [CONTRIBUTING.md](../CONTRIBUTING.md) for ways to participate in development.

### Priority Areas
1. Core blockchain implementation
2. Documentation improvements
3. Testing infrastructure
4. Community building

---

*Roadmap is subject to change based on community feedback and resource availability.*
*Last Updated: 2026-02*
