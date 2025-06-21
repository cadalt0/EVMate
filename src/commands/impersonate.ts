import { Command } from 'commander';
import { ethers } from 'ethers';
import chalk from 'chalk';
import ora from 'ora';
import { AnvilManager } from '../utils/anvil';
import { getNetworkConfig } from '../utils/networks';
import { AnvilConfig } from '../types';

export function impersonateCommand(program: Command): void {
  program
    .command('impersonate')
    .description('Impersonate an account and perform operations')
    .requiredOption('-a, --address <address>', 'Address to impersonate')
    .requiredOption('-f, --fork <network>', 'Network to fork (mainnet, goerli, sepolia, etc.)')
    .option('-b, --block <number>', 'Block number to fork from')
    .option('-p, --port <port>', 'Port to run Anvil on', '8545')
    .option('--balance <balance>', 'Set balance for impersonated account', '1000000000000000000000')
    .option('--keep', 'Keep Anvil running after command completes')
    .action(async (options: any) => {
      const spinner = ora('Starting Anvil and impersonating account...').start();
      
      try {
        // Validate address
        if (!ethers.isAddress(options.address)) {
          throw new Error(`Invalid address: ${options.address}`);
        }

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
        
        spinner.text = 'Impersonating account...';
        const provider = anvil.getProvider();
        
        // Impersonate the account
        await provider.send('anvil_impersonateAccount', [options.address]);
        
        // Set balance for the impersonated account
        await provider.send('anvil_setBalance', [
          options.address,
          ethers.parseEther(options.balance).toString()
        ]);
        
        spinner.succeed(`Successfully impersonated ${options.address}!`);
        
        console.log('\n' + chalk.bold('Impersonation Results'));
        console.log('='.repeat(50));
        console.log(chalk.cyan('Impersonated Address:'), options.address);
        console.log(chalk.cyan('Network:'), network.name);
        console.log(chalk.cyan('Balance Set:'), ethers.formatEther(options.balance), 'ETH');
        console.log(chalk.cyan('Local RPC:'), `http://127.0.0.1:${options.port}`);
        
        if (options.keep) {
          console.log('\n' + chalk.yellow('Anvil is running with impersonated account.'));
          console.log(chalk.yellow('You can now send transactions from this address.'));
          console.log(chalk.yellow('Press Ctrl+C to stop.'));
          
          // Keep the process alive
          process.on('SIGINT', async () => {
            console.log('\n' + chalk.yellow('Stopping Anvil...'));
            await anvil.stop();
            console.log(chalk.green('Anvil stopped.'));
            process.exit(0);
          });
          
          // Keep the process running
          await new Promise(() => {});
        } else {
          await anvil.stop();
          console.log(chalk.green('Anvil stopped.'));
        }
        
      } catch (error) {
        spinner.fail('Impersonation failed');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
} 