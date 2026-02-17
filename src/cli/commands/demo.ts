/**
 * Demo command - Shows the full reversible transaction flow
 */

import { Command } from 'commander';
import { createWallet, getAddress, getBalance, send, confirmReceived, cancelSent } from '../../wallet/wallet.js';
import { mintTokens } from '../../blockchain/ledger.js';
import { StateManager } from '../state.js';

const stateManager = new StateManager();

export function demoCommand(): Command {
  const demo = new Command('demo').description('Interactive demo of reversible transactions');

  demo.action(async () => {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  🎭 MOUSEION DEMO: Reversible Transaction Flow');
    console.log('═'.repeat(60));
    console.log('\nThis demo shows how reversible transactions work.');
    console.log('We\'ll create two wallets and send tokens between them.\n');

    await sleep(1000);

    // Step 1: Create wallets
    console.log('─'.repeat(60));
    console.log('STEP 1: Creating wallets');
    console.log('─'.repeat(60));

    const state = stateManager.load();

    const aliceWallet = createWallet('Alice');
    const bobWallet = createWallet('Bob');

    state.wallets.push(aliceWallet, bobWallet);
    state.activeWallet = aliceWallet;

    console.log(`  ✓ Created wallet: Alice`);
    console.log(`    Address: ${getAddress(aliceWallet).slice(0, 30)}...`);
    console.log(`  ✓ Created wallet: Bob`);
    console.log(`    Address: ${getAddress(bobWallet).slice(0, 30)}...`);

    await sleep(1500);

    // Step 2: Mint tokens
    console.log('\n─'.repeat(60));
    console.log('STEP 2: Minting test tokens to Alice');
    console.log('─'.repeat(60));

    mintTokens(state.ledger, getAddress(aliceWallet), 1000n);
    const aliceBalance = getBalance(aliceWallet, state.ledger);

    console.log(`  ✓ Minted 1000 tokens to Alice`);
    console.log(`    Alice's balance: ${aliceBalance.available.toString()}`);

    await sleep(1500);

    // Step 3: Send transaction
    console.log('\n─'.repeat(60));
    console.log('STEP 3: Alice sends 100 tokens to Bob');
    console.log('─'.repeat(60));

    const sendResult = send(aliceWallet, state.ledger, getAddress(bobWallet), 100n, {
      memo: 'Payment for coffee',
      gracePeriod: 180000, // 3 minutes (minimum allowed)
    });

    if (!sendResult.success) {
      console.error(`  ✗ Failed: ${sendResult.error}`);
      return;
    }

    const txn = sendResult.transaction!;
    console.log(`  ✓ Transaction created: ${txn.id.slice(0, 12)}...`);
    console.log(`    Status: ${txn.state}`);
    console.log(`    Amount: 100 tokens`);
    console.log(`    Memo: "${txn.memo}"`);

    await sleep(500);

    // Show balances after sending
    const aliceAfterSend = getBalance(aliceWallet, state.ledger);
    const bobAfterSend = getBalance(bobWallet, state.ledger);

    console.log('\n  📊 Balances after sending (transaction is PENDING):');
    console.log(`    Alice: ${aliceAfterSend.available} available, ${aliceAfterSend.pendingOutgoing} pending out`);
    console.log(`    Bob:   ${bobAfterSend.available} available, ${bobAfterSend.pendingIncoming} pending in`);

    console.log('\n  💡 Notice: Funds are locked but not yet transferred!');
    console.log('     Alice can still CANCEL this transaction.');
    console.log('     Bob can CONFIRM to receive the funds immediately.');

    await sleep(2000);

    // Step 4: Show options
    console.log('\n─'.repeat(60));
    console.log('STEP 4: What can happen next?');
    console.log('─'.repeat(60));

    console.log('\n  Option A: Bob confirms → Funds transfer immediately');
    console.log('  Option B: Alice cancels → Funds return to Alice');
    console.log('  Option C: No action → Auto-finalize after grace period');

    await sleep(1500);

    // Step 5: Bob confirms
    console.log('\n─'.repeat(60));
    console.log('STEP 5: Bob confirms the transaction');
    console.log('─'.repeat(60));

    const confirmResult = confirmReceived(bobWallet, state.ledger, txn.id);

    if (!confirmResult.success) {
      console.error(`  ✗ Failed: ${confirmResult.error}`);
      return;
    }

    console.log(`  ✓ Transaction confirmed!`);
    console.log(`    Status: ${confirmResult.transaction!.state}`);

    const aliceFinal = getBalance(aliceWallet, state.ledger);
    const bobFinal = getBalance(bobWallet, state.ledger);

    console.log('\n  📊 Final balances:');
    console.log(`    Alice: ${aliceFinal.available} (was 1000, sent 100)`);
    console.log(`    Bob:   ${bobFinal.available} (received 100)`);

    stateManager.save(state);

    await sleep(1500);

    // Demo cancel scenario
    console.log('\n─'.repeat(60));
    console.log('BONUS: Demonstrating cancellation');
    console.log('─'.repeat(60));

    console.log('\n  Let\'s show what happens when a transaction is CANCELLED...');

    await sleep(1000);

    // Send another transaction
    const sendResult2 = send(aliceWallet, state.ledger, getAddress(bobWallet), 50n, {
      memo: 'Oops, wrong amount!',
      gracePeriod: 180000, // 3 minutes (minimum allowed)
    });

    const txn2 = sendResult2.transaction!;
    console.log(`\n  ✓ Alice sends 50 more tokens (tx: ${txn2.id.slice(0, 8)})`);

    const aliceBeforeCancel = getBalance(aliceWallet, state.ledger);
    console.log(`    Alice's available: ${aliceBeforeCancel.available} (50 locked as pending)`);

    await sleep(1500);

    // Cancel it
    console.log('\n  🚫 Alice realizes the mistake and cancels...');
    const cancelResult = cancelSent(aliceWallet, state.ledger, txn2.id);

    if (cancelResult.success) {
      console.log(`  ✓ Transaction CANCELLED!`);

      const aliceAfterCancel = getBalance(aliceWallet, state.ledger);
      console.log(`    Alice's available: ${aliceAfterCancel.available} (funds returned)`);
    }

    stateManager.save(state);

    await sleep(1500);

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('  📚 DEMO COMPLETE');
    console.log('═'.repeat(60));
    console.log('\n  Key features demonstrated:');
    console.log('  • Transactions start in PENDING state');
    console.log('  • Sender can CANCEL before finalization');
    console.log('  • Recipient can CONFIRM to receive immediately');
    console.log('  • Funds are locked during pending period');
    console.log('  • Full audit trail maintained');

    console.log('\n  Try it yourself:');
    console.log('    mouseion wallet create');
    console.log('    mouseion faucet 1000');
    console.log('    mouseion tx send <address> 100');
    console.log('    mouseion tx pending');
    console.log();
  });

  return demo;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
