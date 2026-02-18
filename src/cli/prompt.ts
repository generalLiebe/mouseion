/**
 * Password prompt utilities for CLI
 *
 * Provides masked password input for encryption/decryption operations
 */

import * as readline from 'readline';

/**
 * Prompt for a password with masked input
 */
export function promptPassword(message: string = 'Password: '): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Mask input by overwriting characters with '*'
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    let password = '';
    process.stdout.write(message);

    const onData = (char: Buffer) => {
      const c = char.toString('utf8');

      if (c === '\n' || c === '\r' || c === '\u0004') {
        // Enter or Ctrl+D
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw ?? false);
        }
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        rl.close();
        resolve(password);
      } else if (c === '\u0003') {
        // Ctrl+C
        if (stdin.isTTY) {
          stdin.setRawMode(wasRaw ?? false);
        }
        stdin.removeListener('data', onData);
        rl.close();
        process.exit(1);
      } else if (c === '\u007F' || c === '\b') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += c;
        process.stdout.write('*');
      }
    };

    stdin.on('data', onData);
  });
}

/**
 * Prompt for password confirmation (enter twice, must match)
 */
export async function promptConfirmPassword(): Promise<string> {
  const password = await promptPassword('Enter password: ');

  if (password.length === 0) {
    console.error('Error: Password cannot be empty');
    process.exit(1);
  }

  const confirm = await promptPassword('Confirm password: ');

  if (password !== confirm) {
    console.error('Error: Passwords do not match');
    process.exit(1);
  }

  return password;
}
