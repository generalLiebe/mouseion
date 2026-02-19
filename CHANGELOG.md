# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2024-02

### Added

#### Core Blockchain
- Reversible transaction blockchain implementation
- Transaction state machine (PENDING, FINALIZED, CANCELLED, FROZEN, RECOVERED)
- Block creation and validation with Merkle root
- Account management with balance tracking (available, pending incoming/outgoing)
- Guardian freeze/recover mechanism for fraud prevention

#### Wallet & CLI
- CLI tool for interacting with the blockchain
- Wallet management commands (create, list, show, use, export)
- Transaction commands (send, confirm, cancel, pending, history)
- Faucet command for minting test tokens
- Interactive demo showcasing reversible transaction flow
- State persistence between CLI sessions

#### Cryptography
- Ed25519 key pair generation
- Transaction signing and verification
- SHA-256 hashing
- Handshake mechanism with one-time keys

#### Documentation
- Whitepaper (English and Japanese)
- Technical specifications
  - Reversible blockchain spec
  - Royalty distribution spec
- Roadmap with business and technical milestones
- Monetization strategy document
- Tokenomics design

#### Business Development
- Pilot program proposal template
- Pricing documentation
- Grant application templates
  - Web3 Foundation
  - Cosmos Ecosystem
  - General template

#### Testing
- 62 unit tests covering:
  - Ledger operations
  - Transaction state transitions
  - Wallet functionality

### Technical Stack
- TypeScript with ES modules
- Node.js 18+
- Vitest for testing
- Commander.js for CLI

---

## Roadmap Status

### Completed
- [x] Phase 0: T0.1 (Repository Setup), T0.2 (Basic Prototype)
- [x] Phase 1: L1.1 (Blockchain), L1.2 (Token), L1.5 (CLI Wallet)

### In Progress
- [ ] Phase 0: B0.1-B0.3 (Grant applications, B2B contracts)
- [ ] Phase 1: L1.3 (Data registration), L1.4 (Reward distribution)

### Planned
- [ ] Phase 2: Contribution Tracking
- [ ] Phase 3: Governance
- [ ] Phase 4: Ecosystem Expansion
- [ ] Phase 5: Advanced Features

---

*For detailed roadmap, see [docs/roadmap.md](./docs/roadmap.md)*
