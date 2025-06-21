import { spawn, ChildProcess } from 'child_process';
import { ethers } from 'ethers';
import { AnvilConfig } from '../types';

export class AnvilManager {
  private process: ChildProcess | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private config: AnvilConfig;

  constructor(config: AnvilConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.process) {
      throw new Error('Anvil is already running');
    }

    const args = [
      '--port', this.config.port.toString(),
      '--host', this.config.host,
    ];

    if (this.config.forkUrl) {
      args.push('--fork-url', this.config.forkUrl);
    }

    if (this.config.forkBlockNumber) {
      args.push('--fork-block-number', this.config.forkBlockNumber.toString());
    }

    if (this.config.gasLimit) {
      args.push('--gas-limit', this.config.gasLimit.toString());
    }

    if (this.config.blockTime) {
      args.push('--block-time', this.config.blockTime.toString());
    }

    if (this.config.accounts) {
      args.push('--accounts', this.config.accounts.toString());
    }

    if (this.config.balance) {
      args.push('--balance', this.config.balance);
    }

    this.process = spawn('anvil', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Wait for Anvil to be ready
    await this.waitForReady();

    // Create provider
    this.provider = new ethers.JsonRpcProvider(`http://${this.config.host}:${this.config.port}`);
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
      this.provider = null;
    }
  }

  getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      throw new Error('Anvil is not running');
    }
    return this.provider;
  }

  private async waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject(new Error('Process not started'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for Anvil to start'));
      }, 10000);

      this.process!.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Listening on')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      this.process!.stderr?.on('data', (data) => {
        const error = data.toString();
        if (error.includes('error') || error.includes('Error')) {
          clearTimeout(timeout);
          reject(new Error(`Anvil error: ${error}`));
        }
      });

      this.process!.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
}

export function buildAnvilArgs(config: AnvilConfig): string[] {
  const args = [
    '--port', config.port.toString(),
    '--host', config.host,
  ];

  if (config.forkUrl) {
    args.push('--fork-url', config.forkUrl);
  }

  if (config.forkBlockNumber) {
    args.push('--fork-block-number', config.forkBlockNumber.toString());
  }

  if (config.gasLimit) {
    args.push('--gas-limit', config.gasLimit.toString());
  }

  if (config.blockTime) {
    args.push('--block-time', config.blockTime.toString());
  }

  if (config.accounts) {
    args.push('--accounts', config.accounts.toString());
  }

  if (config.balance) {
    args.push('--balance', config.balance);
  }

  return args;
} 