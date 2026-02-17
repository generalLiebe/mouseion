/**
 * Wallet commands for CLI
 */

import { Command } from 'commander';
import { createWallet, getAddress, exportWallet, getBalance } from '../../wallet/wallet.js';
import { StateManager } from '../state.js';

const stateManager = new StateManager();

export function walletCommands(): Command {
  const wallet = new Command('wallet').description('Wallet management commands');

  // Create wallet
  wallet
    .command('create')
    .description('Create a new wallet')
    .option('-n, --name <name>', 'Wallet name')
    .action((options) => {
      const state = stateManager.load();

      const newWallet = createWallet(options.name);
      state.wallets.push(newWallet);

      // Set as active if it's the first wallet
      if (!state.activeWallet) {
        state.activeWallet = newWallet;
      }

      stateManager.save(state);

      const address = getAddress(newWallet);

      console.log('\n✓ Wallet created successfully!');
      console.log('─'.repeat(50));
      console.log(`  Name:    ${newWallet.name || '(unnamed)'}`);
      console.log(`  Address: ${address}`);
      console.log('─'.repeat(50));
      console.log('\nNext steps:');
      console.log('  1. Get test tokens:  mouseion faucet 1000');
      console.log('  2. Check balance:    mouseion balance');
    });

  // List wallets
  wallet
    .command('list')
    .description('List all wallets')
    .action(() => {
      const state = stateManager.load();

      if (state.wallets.length === 0) {
        console.log('\nNo wallets found. Create one with: mouseion wallet create');
        return;
      }

      console.log('\n📋 Wallets');
      console.log('─'.repeat(60));

      state.wallets.forEach((w, i) => {
        const isActive = state.activeWallet?.keyPair.publicKey === w.keyPair.publicKey;
        const marker = isActive ? '→' : ' ';
        const balance = getBalance(w, state.ledger);
        const shortAddr = w.keyPair.publicKey.slice(0, 20) + '...';

        console.log(
          `${marker} [${i}] ${w.name || '(unnamed)'}`
        );
        console.log(`      Address: ${shortAddr}`);
        console.log(`      Balance: ${balance.available.toString()} available`);
      });

      console.log('─'.repeat(60));
    });

  // Show active wallet
  wallet
    .command('show')
    .description('Show active wallet details')
    .action(() => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet. Create one first: mouseion wallet create');
        process.exit(1);
      }

      const w = state.activeWallet;
      const balance = getBalance(w, state.ledger);

      console.log('\n📱 Active Wallet');
      console.log('─'.repeat(60));
      console.log(`  Name:             ${w.name || '(unnamed)'}`);
      console.log(`  Address:          ${w.keyPair.publicKey}`);
      console.log(`  Created:          ${new Date(w.createdAt).toLocaleString()}`);
      console.log('─'.repeat(60));
      console.log('  Balance:');
      console.log(`    Available:      ${balance.available.toString()}`);
      console.log(`    Pending Out:    ${balance.pendingOutgoing.toString()}`);
      console.log(`    Pending In:     ${balance.pendingIncoming.toString()}`);
      console.log('─'.repeat(60));
    });

  // Switch active wallet
  wallet
    .command('use')
    .description('Switch active wallet')
    .argument('<index>', 'Wallet index (from wallet list)')
    .action((index: string) => {
      const state = stateManager.load();
      const idx = parseInt(index, 10);

      if (isNaN(idx) || idx < 0 || idx >= state.wallets.length) {
        console.error(`Error: Invalid wallet index. Use 0-${state.wallets.length - 1}`);
        process.exit(1);
      }

      state.activeWallet = state.wallets[idx];
      stateManager.save(state);

      console.log(`\n✓ Switched to wallet: ${state.activeWallet.name || '(unnamed)'}`);
    });

  // Export wallet (for backup)
  wallet
    .command('export')
    .description('Export wallet for backup (includes private key!)')
    .action(() => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet');
        process.exit(1);
      }

      const exported = exportWallet(state.activeWallet);

      console.log('\n⚠️  WARNING: This includes your private key. Keep it secret!');
      console.log('─'.repeat(60));
      console.log(JSON.stringify(exported, null, 2));
      console.log('─'.repeat(60));
    });

  // Get address only
  wallet
    .command('address')
    .description('Show wallet address (for receiving funds)')
    .action(() => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet');
        process.exit(1);
      }

      console.log('\n📬 Your Address (share this to receive funds):');
      console.log(state.activeWallet.keyPair.publicKey);
    });

  return wallet;
}
