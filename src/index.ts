#!/usr/bin/env node

import { Command } from 'commander';
import { simulateCommand } from './commands/simulate';
import { forkCommand } from './commands/fork';
import { inspectCommand } from './commands/inspect';
import { impersonateCommand } from './commands/impersonate';
import { version } from '../package.json';

const program = new Command();

program
  .name('eth-cli')
  .description('CLI wrapper around Anvil for Ethereum development and debugging')
  .version(version);

// Add commands
simulateCommand(program);
forkCommand(program);
inspectCommand(program);
impersonateCommand(program);

// Global error handler
program.exitOverride();

try {
  program.parse();
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
} 