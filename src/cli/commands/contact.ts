/**
 * Contact (address book) commands for CLI
 */

import { Command } from 'commander';
import { StateManager } from '../state.js';
import { isValidAddress } from '../../contacts/validation.js';
import type { Contact } from '../../contacts/types.js';

const stateManager = new StateManager();

export function contactCommands(): Command {
  const contact = new Command('contact').description('Address book commands');

  // Add contact
  contact
    .command('add')
    .description('Add a contact to your address book')
    .argument('<name>', 'Contact name')
    .argument('<address>', 'Wallet address (64 hex chars)')
    .option('-m, --memo <memo>', 'Optional memo/note')
    .action((name: string, address: string, options) => {
      const state = stateManager.loadPublicOnly();

      if (!isValidAddress(address)) {
        console.error('Error: Invalid address. Must be 64 hex characters.');
        process.exit(1);
      }

      // Check for duplicate name
      const existing = state.contacts.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        console.error(`Error: Contact "${name}" already exists. Remove it first to update.`);
        process.exit(1);
      }

      // Check for duplicate address
      const existingAddr = state.contacts.find(
        (c) => c.address.toLowerCase() === address.toLowerCase()
      );
      if (existingAddr) {
        console.error(`Error: Address already saved as "${existingAddr.name}".`);
        process.exit(1);
      }

      const newContact: Contact = {
        name,
        address: address.toLowerCase(),
        memo: options.memo,
        createdAt: Date.now(),
      };

      state.contacts.push(newContact);
      stateManager.saveContactsOnly(state.contacts);

      console.log(`\n✓ Contact added: ${name}`);
      console.log(`  Address: ${address.slice(0, 20)}...`);
      if (options.memo) {
        console.log(`  Memo:    ${options.memo}`);
      }
    });

  // List contacts
  contact
    .command('list')
    .description('List all contacts')
    .action(() => {
      const state = stateManager.loadPublicOnly();

      if (state.contacts.length === 0) {
        console.log('\nNo contacts yet. Add one with: mouseion contact add <name> <address>');
        return;
      }

      console.log('\n📇 Address Book');
      console.log('─'.repeat(60));

      state.contacts.forEach((c) => {
        const shortAddr = c.address.slice(0, 20) + '...';
        console.log(`  ${c.name}`);
        console.log(`    Address: ${shortAddr}`);
        if (c.memo) {
          console.log(`    Memo:    ${c.memo}`);
        }
      });

      console.log('─'.repeat(60));
      console.log(`  ${state.contacts.length} contact(s)`);
    });

  // Remove contact
  contact
    .command('remove')
    .description('Remove a contact from your address book')
    .argument('<name>', 'Contact name')
    .action((name: string) => {
      const state = stateManager.loadPublicOnly();

      const index = state.contacts.findIndex(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );

      if (index === -1) {
        console.error(`Error: Contact "${name}" not found.`);
        process.exit(1);
      }

      const removed = state.contacts.splice(index, 1)[0];
      stateManager.saveContactsOnly(state.contacts);

      console.log(`\n✓ Contact removed: ${removed.name}`);
    });

  return contact;
}
