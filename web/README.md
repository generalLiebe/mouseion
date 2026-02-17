# Mouseion Web GUI

Web interface for the Mouseion reversible transaction blockchain.

## Setup

### Prerequisites

- Node.js >= 18.0.0
- The parent `mouseion` project must be built first

### Installation

```bash
# From the repository root
npm install
npm run build

# Install web dependencies
cd web
npm install
```

### Development

```bash
# From the web/ directory
npm run dev

# Or from the repository root
npm run web:dev
```

The development server starts at [http://localhost:3000](http://localhost:3000).

## Architecture

The Web GUI is a Next.js application that reuses the existing TypeScript blockchain library via API Routes. The CLI and Web GUI share the same state file (`~/.mouseion/state.json`), so wallets and transactions created in one interface are visible in the other.

```
Browser (React) → Next.js API Routes → mouseion library → ~/.mouseion/state.json
                                                              ↑
CLI (Commander.js) → mouseion library ────────────────────────┘
```

## Features

- **Dashboard**: Balance overview, quick actions, recent transactions
- **Send**: Create transactions with configurable grace periods
- **Transactions**: Filter, confirm, and cancel transactions
- **Wallets**: Create and manage multiple wallets
- **Dark Mode**: Toggle between light and dark themes

## API Endpoints

| Method | Path | Description |
|:--|:--|:--|
| GET | `/api/status` | Blockchain status |
| GET | `/api/wallets` | List wallets |
| POST | `/api/wallets` | Create wallet |
| POST | `/api/wallets/active` | Switch active wallet |
| GET | `/api/balance` | Get balance |
| POST | `/api/faucet` | Mint test tokens |
| GET | `/api/transactions` | Transaction history |
| POST | `/api/transactions` | Send tokens |
| GET | `/api/transactions/[txId]` | Transaction details |
| POST | `/api/transactions/[txId]/confirm` | Confirm receipt |
| POST | `/api/transactions/[txId]/cancel` | Cancel transaction |

## Design System

See [docs/design-system.md](../docs/design-system.md) for the complete design reference.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 + custom design tokens
- **Components**: shadcn/ui patterns (custom implementation)
- **Data Fetching**: SWR with auto-refresh
- **Icons**: Lucide React
- **Notifications**: Sonner
