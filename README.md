# Mouseion

> Fair value distribution for AI contributions

[日本語版 README](./README_ja.md)

## Overview

Mouseion is a decentralized protocol that tracks contributions to AI systems and distributes royalties fairly to data providers, creators, reviewers, and AI developers. Built on a reversible-transaction blockchain, it ensures transparent, auditable, and recoverable payment flows.

## The Problem

Current AI systems have fundamental issues:

- **No Compensation**: Data providers who train AI models receive no rewards
- **Lack of Transparency**: No way to track which data was used for AI training/generation
- **Rights Violations**: Data is used regardless of copyright holders' intentions
- **Centralized Control**: A few corporations monopolize AI systems
- **Data Loss**: Service shutdowns or account deletions cause permanent data loss

## Our Solution

Mouseion provides:

- **Data Sovereignty**: Data providers maintain control over their data
- **Fair Rewards**: Transparent reward distribution based on contribution
- **Democratic Governance**: All contributors can participate in system operations
- **Permanent Storage**: Data persists on the blockchain
- **Full Traceability**: Generated content can be traced to its sources

## Key Features

### Reversible Transaction Blockchain
A novel Layer 1 blockchain where transactions are held in a pending state until confirmed, enabling:
- Recovery from accidental transfers
- Fraud prevention through guardian review
- Safe multi-party transactions

### Expert Annotation System
- Field-specific expert selection via classification tables
- Cross-review for quality assurance
- Reputation-based expert matching

### Human/AI Data Separation
- Prevents model collapse from AI-generated training data
- Preserves value of human-created content
- Clear tagging: "Human", "AI-generated", "AI-assisted"

### AI Model Version Control
- On-chain version tracking
- Prevents silent model changes
- Users can select specific versions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Application Layer                                          │
│  - Wallet UI  - Data Registration  - Reward Dashboard       │
│  - Governance Voting  - Marketplace                         │
├─────────────────────────────────────────────────────────────┤
│  Service Layer: AI Royalty Distribution System              │
│  - Contribution Tracking  - Reward Distribution             │
│  - Governance  - Data Management                            │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Reversible Transaction Blockchain (Julia)         │
│  - Pending Transfers  - Cancellation  - Guardian Approval   │
└─────────────────────────────────────────────────────────────┘
```

## Documentation

- [Whitepaper](./docs/whitepaper.md) - Project vision and detailed design
- [Architecture](./docs/architecture.md) - System architecture overview
- [Tokenomics](./docs/tokenomics.md) - Token economy design
- [Roadmap](./docs/roadmap.md) - Development phases

## Specifications

- [Reversible Blockchain](./specs/reversible-blockchain.md) - Layer 1 blockchain specification
- [Royalty Distribution](./specs/royalty-distribution.md) - Contribution tracking and reward system

## Getting Started

> Note: This project is in early development. We're building the foundation.

```bash
# Clone the repository
git clone https://github.com/yourusername/mouseion.git
cd mouseion

# More instructions coming soon...
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

Before contributing, please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

### Good First Issues

We maintain issues labeled `good first issue` for newcomers. These include:
- Documentation improvements
- Test additions
- Minor bug fixes

## Roadmap

| Phase | Focus | Status |
|:--|:--|:--|
| Phase 1 | Foundation (MVP) | In Progress |
| Phase 2 | Contribution Tracking | Planned |
| Phase 3 | Governance | Planned |
| Phase 4 | Ecosystem Expansion | Planned |
| Phase 5 | Advanced Features | Planned |

See [Roadmap](./docs/roadmap.md) for details.

## Comparison with Existing Solutions

| Feature | Mouseion | Story Protocol | Sony AI | OutAI |
|:--|:--|:--|:--|:--|
| Contributor Identification | Yes | Yes | Music only | Limited |
| Auto Reward Distribution | Yes | Yes | Unknown | Yes |
| Governance | Yes | Yes | No | Yes |
| Expert Annotation | **Unique** | No | No | No |
| Cross-Review Evaluation | **Unique** | No | No | No |
| Human/AI Data Separation | **Unique** | No | No | No |
| AI Version Control | **Unique** | No | No | No |
| Reversible Transactions | **Unique** | No | No | No |

## Community

- [Discord](#) (Coming soon)
- [Twitter/X](#) (Coming soon)
- [Blog](#) (Coming soon)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

This project draws inspiration from various open-source projects in the Web3 and AI spaces.

---

Built with the vision of fair AI for everyone.
