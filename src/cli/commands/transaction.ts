/**
 * Transaction commands for CLI
 */

import { Command } from 'commander';
import {
  send,
  confirmReceived,
  cancelSent,
  getPendingTransactions,
  getTransactionHistory,
} from '../../wallet/wallet.js';
import { TransactionState } from '../../blockchain/types.js';
import { getTransaction } from '../../blockchain/ledger.js';
import { StateManager } from '../state.js';

const stateManager = new StateManager();

export function transactionCommands(): Command {
  const tx = new Command('tx').description('Transaction commands');

  // Send funds
  tx.command('send')
    .description('Send tokens to another address')
    .argument('<recipient>', 'Recipient address')
    .argument('<amount>', 'Amount to send')
    .option('-m, --memo <memo>', 'Optional memo')
    .option('-g, --grace <ms>', 'Grace period in milliseconds (min 180000)', '180000')
    .action((recipient: string, amount: string, options) => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet. Create one first: mouseion wallet create');
        process.exit(1);
      }

      const parsedAmount = BigInt(amount);
      const gracePeriod = parseInt(options.grace, 10);

      const result = send(state.activeWallet, state.ledger, recipient, parsedAmount, {
        memo: options.memo,
        gracePeriod,
      });

      if (!result.success) {
        console.error(`\n✗ Transaction failed: ${result.error}`);
        process.exit(1);
      }

      stateManager.save(state);

      const txn = result.transaction!;
      const expiresIn = Math.round((txn.expiresAt - Date.now()) / 1000);

      console.log('\n✓ Transaction created (PENDING)');
      console.log('─'.repeat(60));
      console.log(`  Transaction ID: ${txn.id}`);
      console.log(`  Amount:         ${txn.amount.toString()}`);
      console.log(`  Recipient:      ${recipient.slice(0, 30)}...`);
      console.log(`  Status:         ${txn.state}`);
      console.log(`  Expires in:     ${expiresIn} seconds`);
      if (options.memo) {
        console.log(`  Memo:           ${options.memo}`);
      }
      console.log('─'.repeat(60));
      console.log('\n📝 The transaction is now PENDING.');
      console.log('   The recipient can confirm it, or you can cancel it.');
      console.log('   If no action is taken, it will auto-finalize after the grace period.');
      console.log(`\n   To cancel: mouseion tx cancel ${txn.id.slice(0, 8)}`);
    });

  // Confirm received transaction
  tx.command('confirm')
    .description('Confirm a received transaction')
    .argument('<txId>', 'Transaction ID (or prefix)')
    .action((txIdPrefix: string) => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet');
        process.exit(1);
      }

      // Find transaction by prefix
      const txId = findTransactionByPrefix(state, txIdPrefix);
      if (!txId) {
        console.error(`\n✗ Transaction not found: ${txIdPrefix}`);
        process.exit(1);
      }

      const result = confirmReceived(state.activeWallet, state.ledger, txId);

      if (!result.success) {
        console.error(`\n✗ Failed to confirm: ${result.error}`);
        process.exit(1);
      }

      stateManager.save(state);

      console.log('\n✓ Transaction confirmed (FINALIZED)');
      console.log(`  Transaction ID: ${txId}`);
      console.log(`  Amount:         ${result.transaction!.amount.toString()}`);
      console.log('\n  Funds are now available in your wallet.');
    });

  // Cancel sent transaction
  tx.command('cancel')
    .description('Cancel a pending transaction you sent')
    .argument('<txId>', 'Transaction ID (or prefix)')
    .action((txIdPrefix: string) => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet');
        process.exit(1);
      }

      // Find transaction by prefix
      const txId = findTransactionByPrefix(state, txIdPrefix);
      if (!txId) {
        console.error(`\n✗ Transaction not found: ${txIdPrefix}`);
        process.exit(1);
      }

      const result = cancelSent(state.activeWallet, state.ledger, txId);

      if (!result.success) {
        console.error(`\n✗ Failed to cancel: ${result.error}`);
        process.exit(1);
      }

      stateManager.save(state);

      console.log('\n✓ Transaction cancelled (CANCELLED)');
      console.log(`  Transaction ID: ${txId}`);
      console.log(`  Amount:         ${result.transaction!.amount.toString()}`);
      console.log('\n  Funds have been returned to your wallet.');
    });

  // List pending transactions
  tx.command('pending')
    .description('List pending transactions')
    .action(() => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet');
        process.exit(1);
      }

      const pending = getPendingTransactions(state.activeWallet, state.ledger);

      if (pending.length === 0) {
        console.log('\nNo pending transactions.');
        return;
      }

      console.log('\n⏳ Pending Transactions');
      console.log('─'.repeat(70));

      pending.forEach((entry) => {
        const txn = entry.transaction;
        const direction = entry.direction === 'sent' ? '→ Sent' : '← Received';
        const expiresIn = Math.max(0, Math.round((txn.expiresAt - Date.now()) / 1000));
        const shortId = txn.id.slice(0, 8);
        const shortCounterparty = entry.counterparty.slice(0, 20) + '...';

        console.log(`  ${direction} | ${shortId} | ${txn.amount.toString()} | ${shortCounterparty}`);
        console.log(`         Expires in: ${expiresIn}s`);
        if (entry.direction === 'sent') {
          console.log(`         → Cancel: mouseion tx cancel ${shortId}`);
        } else {
          console.log(`         → Confirm: mouseion tx confirm ${shortId}`);
        }
        console.log();
      });
    });

  // Transaction history
  tx.command('history')
    .description('Show transaction history')
    .option('-n, --limit <n>', 'Number of transactions to show', '10')
    .action((options) => {
      const state = stateManager.load();

      if (!state.activeWallet) {
        console.error('Error: No active wallet');
        process.exit(1);
      }

      const history = getTransactionHistory(state.activeWallet, state.ledger);
      const limit = parseInt(options.limit, 10);
      const displayed = history.slice(0, limit);

      if (displayed.length === 0) {
        console.log('\nNo transaction history.');
        return;
      }

      console.log('\n📜 Transaction History');
      console.log('─'.repeat(80));

      displayed.forEach((entry) => {
        const txn = entry.transaction;
        const direction = entry.direction === 'sent' ? '↑ SENT' : '↓ RECV';
        const status = getStatusEmoji(txn.state);
        const shortId = txn.id.slice(0, 8);
        const date = new Date(txn.createdAt).toLocaleString();

        console.log(
          `  ${direction} | ${status} ${txn.state.padEnd(10)} | ${txn.amount.toString().padStart(10)} | ${shortId} | ${date}`
        );
      });

      console.log('─'.repeat(80));
      if (history.length > limit) {
        console.log(`  ... and ${history.length - limit} more transactions`);
      }
    });

  // Show specific transaction
  tx.command('show')
    .description('Show transaction details')
    .argument('<txId>', 'Transaction ID (or prefix)')
    .action((txIdPrefix: string) => {
      const state = stateManager.load();

      const txId = findTransactionByPrefix(state, txIdPrefix);
      if (!txId) {
        console.error(`\n✗ Transaction not found: ${txIdPrefix}`);
        process.exit(1);
      }

      const txn = getTransaction(state.ledger, txId);
      if (!txn) {
        console.error(`\n✗ Transaction not found: ${txId}`);
        process.exit(1);
      }

      console.log('\n📋 Transaction Details');
      console.log('─'.repeat(60));
      console.log(`  ID:        ${txn.id}`);
      console.log(`  Status:    ${getStatusEmoji(txn.state)} ${txn.state}`);
      console.log(`  Amount:    ${txn.amount.toString()}`);
      console.log(`  Sender:    ${txn.sender}`);
      console.log(`  Recipient: ${txn.recipient}`);
      console.log(`  Memo:      ${txn.memo || '(none)'}`);
      console.log(`  Created:   ${new Date(txn.createdAt).toLocaleString()}`);
      console.log(`  Expires:   ${new Date(txn.expiresAt).toLocaleString()}`);
      console.log(`  Version:   ${txn.version}`);
      console.log('─'.repeat(60));
    });

  return tx;
}

// Helper functions
function findTransactionByPrefix(state: any, prefix: string): string | null {
  // Check pending transactions first
  for (const txId of state.ledger.pendingTransactions.keys()) {
    if (txId.startsWith(prefix)) {
      return txId;
    }
  }

  // Check all transactions
  for (const txId of state.ledger.transactionIndex.keys()) {
    if (txId.startsWith(prefix)) {
      return txId;
    }
  }

  return null;
}

function getStatusEmoji(state: TransactionState): string {
  switch (state) {
    case TransactionState.PENDING:
      return '⏳';
    case TransactionState.FINALIZED:
      return '✅';
    case TransactionState.CANCELLED:
      return '❌';
    case TransactionState.FROZEN:
      return '🧊';
    case TransactionState.RECOVERED:
      return '↩️';
    default:
      return '❓';
  }
}
