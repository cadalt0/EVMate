import { Command } from 'commander';
import { ethers } from 'ethers';
import chalk from 'chalk';
import ora from 'ora';
import { AnvilManager } from '../utils/anvil';
import { getNetworkConfig } from '../utils/networks';
import { StateInspection, AnvilConfig } from '../types';

export function inspectCommand(program: Command): void {
  program
    .command('inspect')
    .description('Inspect contract state and balances on a forked network')
    .requiredOption('-a, --address <address>', 'Address to inspect')
    .requiredOption('-f, --fork <network>', 'Network to fork (mainnet, goerli, sepolia, etc.)')
    .option('-b, --block <number>', 'Block number to fork from')
    .option('-s, --slot <slot>', 'Storage slot to inspect')
    .option('-p, --port <port>', 'Port to run Anvil on', '8545')
    .action(async (options: any) => {
      const spinner = ora('Starting Anvil and inspecting address...').start();
      
      try {
        const network = getNetworkConfig(options.fork);
        const anvilConfig: AnvilConfig = {
          port: parseInt(options.port),
          host: '127.0.0.1',
          forkUrl: network.rpcUrl,
        };

        // Add optional properties only if they exist
        if (options.block) {
          anvilConfig.forkBlockNumber = parseInt(options.block);
        }

        const anvil = new AnvilManager(anvilConfig);
        await anvil.start();
        
        spinner.text = 'Inspecting address...';
        const provider = anvil.getProvider();
        
        // Validate address
        if (!ethers.isAddress(options.address)) {
          throw new Error(`Invalid address: ${options.address}`);
        }

        const inspection = await inspectAddress(provider, options.address, options.slot);
        
        await anvil.stop();
        
        spinner.succeed('Inspection completed!');
        displayInspectionResult(inspection, options.address, network);
        
      } catch (error) {
        spinner.fail('Inspection failed');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

async function inspectAddress(
  provider: ethers.JsonRpcProvider,
  address: string,
  slot?: string
): Promise<StateInspection> {
  const balance = await provider.getBalance(address);
  const nonce = await provider.getTransactionCount(address);
  const code = await provider.getCode(address);
  
  const result: StateInspection = {
    balance: balance.toString(),
    nonce,
    code,
  };
  
  if (slot) {
    const storageValue = await provider.getStorage(address, slot);
    result.storage = { [slot]: storageValue };
  }
  
  return result;
}

function displayInspectionResult(
  inspection: StateInspection,
  address: string,
  network: any
): void {
  console.log('\n' + chalk.bold('Address Inspection Results'));
  console.log('='.repeat(50));
  
  console.log(chalk.cyan('Address:'), address);
  console.log(chalk.cyan('Network:'), network.name);
  console.log(chalk.cyan('Balance:'), ethers.formatEther(inspection.balance), 'ETH');
  console.log(chalk.cyan('Nonce:'), inspection.nonce);
  
  if (inspection.code && inspection.code !== '0x') {
    console.log(chalk.cyan('Contract Code:'), 'Yes');
    console.log(chalk.cyan('Code Size:'), (inspection.code.length - 2) / 2, 'bytes');
  } else {
    console.log(chalk.cyan('Contract Code:'), 'No (EOA)');
  }
  
  if (inspection.storage && Object.keys(inspection.storage).length > 0) {
    console.log('\n' + chalk.cyan('Storage:'));
    Object.entries(inspection.storage).forEach(([slot, value]) => {
      console.log(`  ${slot}: ${value}`);
    });
  }
} 