import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AnvilManager } from '../utils/anvil';
import { getNetworkConfig } from '../utils/networks';
import { AnvilConfig } from '../types';

export function forkCommand(program: Command): void {
  program
    .command('fork')
    .description('Start Anvil in fork mode for a specific network')
    .requiredOption('-n, --network <network>', 'Network to fork (mainnet, goerli, sepolia, etc.)')
    .option('-b, --block <number>', 'Block number to fork from')
    .option('-p, --port <port>', 'Port to run Anvil on', '8545')
    .option('-h, --host <host>', 'Host to bind Anvil to', '127.0.0.1')
    .option('-g, --gas-limit <limit>', 'Gas limit', '30000000')
    .option('--keep', 'Keep Anvil running after command completes')
    .action(async (options: any) => {
      const spinner = ora('Starting Anvil in fork mode...').start();
      
      try {
        const network = getNetworkConfig(options.network);
        const anvilConfig: AnvilConfig = {
          port: parseInt(options.port),
          host: options.host,
          forkUrl: network.rpcUrl,
          gasLimit: parseInt(options.gasLimit),
        };

        // Add optional properties only if they exist
        if (options.block) {
          anvilConfig.forkBlockNumber = parseInt(options.block);
        }

        const anvil = new AnvilManager(anvilConfig);
        await anvil.start();
        
        spinner.succeed(`Anvil started successfully!`);
        
        console.log('\n' + chalk.bold('Fork Configuration'));
        console.log('='.repeat(50));
        console.log(chalk.cyan('Network:'), network.name);
        console.log(chalk.cyan('RPC URL:'), network.rpcUrl);
        console.log(chalk.cyan('Chain ID:'), network.chainId);
        if (options.block) {
          console.log(chalk.cyan('Fork Block:'), options.block);
        }
        console.log(chalk.cyan('Local RPC:'), `http://${options.host}:${options.port}`);
        
        if (options.keep) {
          console.log('\n' + chalk.yellow('Anvil is running. Press Ctrl+C to stop.'));
          
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
        spinner.fail('Failed to start Anvil');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
} 