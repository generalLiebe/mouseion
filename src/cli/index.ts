#!/usr/bin/env node
/**
 * Mouseion CLI - Command-line interface for the reversible transaction blockchain
 */

import { Command } from 'commander';
import { walletCommands } from './commands/wallet.js';
import { transactionCommands } from './commands/transaction.js';
import { demoCommand } from './commands/demo.js';
import { StateManager } from './state.js';
import { mintTokens, getOrCreateAccount, getBlockHeight } from '../blockchain/ledger.js';
import { getBalance } from '../wallet/wallet.js';

const program = new Command();

// Initialize state manager (handles persistence)
export const stateManager = new StateManager();

program
  .name('mouseion')
  .description('CLI for Mouseion - Reversible Transaction Blockchain')
  .version('0.1.0');

// Register command groups
program.addCommand(walletCommands());
program.addCommand(transactionCommands());
program.addCommand(demoCommand());

// Faucet command (mint test tokens)
program
  .command('faucet')
  .description('Get test tokens (testnet only)')
  .argument('[amount]', 'Amount of tokens to mint', '1000')
  .action((amount: string) => {
    const state = stateManager.load();

    if (!state.activeWallet) {
      console.error('Error: No active wallet. Create one first: mouseion wallet create');
      process.exit(1);
    }

    const parsedAmount = BigInt(amount);

    mintTokens(state.ledger, state.activeWallet.keyPair.publicKey, parsedAmount);

    const account = getOrCreateAccount(state.ledger, state.activeWallet.keyPair.publicKey);

    stateManager.save(state);

    console.log(`\n✓ Minted ${amount} tokens to your wallet`);
    console.log(`  New balance: ${account.balance.available.toString()} (available)`);
    console.log(`\nNote: This only works on testnet/local mode.`);
  });

// Balance command (shortcut)
program
  .command('balance')
  .description('Check your wallet balance')
  .action(() => {
    const state = stateManager.load();

    if (!state.activeWallet) {
      console.error('Error: No active wallet. Create one first: mouseion wallet create');
      process.exit(1);
    }

    const balance = getBalance(state.activeWallet, state.ledger);

    console.log('\n📊 Wallet Balance');
    console.log('─'.repeat(40));
    console.log(`  Available:        ${balance.available.toString()}`);
    console.log(`  Pending Outgoing: ${balance.pendingOutgoing.toString()}`);
    console.log(`  Pending Incoming: ${balance.pendingIncoming.toString()}`);
    console.log(`  Total:            ${balance.total.toString()}`);
  });

// Status command
program
  .command('status')
  .description('Show current state')
  .action(() => {
    const state = stateManager.load();

    console.log('\n📈 Mouseion Status');
    console.log('─'.repeat(40));
    console.log(`  Network:      Local Testnet`);
    console.log(`  Block Height: ${getBlockHeight(state.ledger)}`);
    console.log(`  Wallets:      ${state.wallets.length}`);

    if (state.activeWallet) {
      const shortAddr = state.activeWallet.keyPair.publicKey.slice(0, 16) + '...';
      console.log(`  Active:       ${state.activeWallet.name || 'unnamed'} (${shortAddr})`);
    } else {
      console.log(`  Active:       None`);
    }

    console.log(`  Pending Txs:  ${state.ledger.pendingTransactions.size}`);
  });

// Parse and execute
program.parse();
