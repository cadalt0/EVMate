import { Command } from 'commander';
import { ethers } from 'ethers';
import chalk from 'chalk';
import ora from 'ora';
import { AnvilManager } from '../utils/anvil';
import { getNetworkConfig } from '../utils/networks';
import { SimulationResult, AnvilConfig } from '../types';

export function simulateCommand(program: Command): void {
  program
    .command('simulate')
    .description('Simulate a transaction on a forked network')
    .requiredOption('-t, --tx <hash>', 'Transaction hash to simulate')
    .requiredOption('-f, --fork <network>', 'Network to fork (mainnet, goerli, sepolia, etc.)')
    .option('-b, --block <number>', 'Block number to fork from')
    .option('-g, --gas-limit <limit>', 'Gas limit for simulation')
    .option('-p, --gas-price <price>', 'Gas price for simulation')
    .option('-i, --impersonate <address>', 'Impersonate a specific account address')
    .action(async (options) => {
      const spinner = ora('Starting Anvil and simulating transaction...').start();
      
      try {
        const network = getNetworkConfig(options.fork);
        const anvilConfig: AnvilConfig = {
          port: 8545,
          host: '127.0.0.1',
          forkUrl: network.rpcUrl,
          gasLimit: options.gasLimit ? parseInt(options.gasLimit) : 30000000,
        };

        // Add optional properties only if they exist
        if (options.block) {
          anvilConfig.forkBlockNumber = parseInt(options.block);
        }

        const anvil = new AnvilManager(anvilConfig);
        await anvil.start();
        
        spinner.text = 'Fetching transaction data...';
        const provider = anvil.getProvider();
        
        // Fetch transaction from source network
        const sourceProvider = new ethers.JsonRpcProvider(network.rpcUrl);
        const tx = await sourceProvider.getTransaction(options.tx);
        
        if (!tx) {
          throw new Error(`Transaction ${options.tx} not found on ${options.fork}`);
        }

        spinner.text = 'Simulating transaction...';
        
        // Prepare simulation options
        const simOptions: { gasLimit?: number; gasPrice?: string; impersonate?: string } = {};
        if (options.gasLimit) {
          simOptions.gasLimit = parseInt(options.gasLimit);
        }
        if (options.gasPrice) {
          simOptions.gasPrice = options.gasPrice;
        }
        if (options.impersonate) {
          simOptions.impersonate = options.impersonate;
        }
        
        // Simulate the transaction
        const result = await simulateTransaction(provider, tx, simOptions);

        await anvil.stop();
        
        spinner.succeed('Simulation completed!');
        displaySimulationResult(result, tx, network, options.impersonate);
        
      } catch (error) {
        spinner.fail('Simulation failed');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}

async function simulateTransaction(
  provider: ethers.JsonRpcProvider,
  tx: ethers.TransactionResponse,
  options: { gasLimit?: number; gasPrice?: string; impersonate?: string }
): Promise<SimulationResult> {
  try {
    // If impersonating, use the impersonated address as the from address
    const fromAddress = options.impersonate || tx.from;
    
    const callData = {
      from: fromAddress,
      to: tx.to,
      value: tx.value,
      data: tx.data,
      gasLimit: options.gasLimit || tx.gasLimit,
      gasPrice: options.gasPrice ? ethers.parseUnits(options.gasPrice, 'gwei') : tx.gasPrice,
    };

    const result = await provider.call(callData);
    
    return {
      success: true,
      gasUsed: '0', // eth_call doesn't return gas used
      returnData: result,
      logs: [],
    };
  } catch (error) {
    return {
      success: false,
      gasUsed: '0',
      returnData: '',
      logs: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function displaySimulationResult(
  result: SimulationResult,
  tx: ethers.TransactionResponse,
  network: any,
  impersonatedAddress?: string
): void {
  console.log('\n' + chalk.bold('Simulation Results'));
  console.log('='.repeat(50));
  
  console.log(chalk.cyan('Transaction:'), tx.hash);
  console.log(chalk.cyan('Original From:'), tx.from);
  if (impersonatedAddress) {
    console.log(chalk.yellow('Impersonated From:'), impersonatedAddress);
  }
  console.log(chalk.cyan('To:'), tx.to || 'Contract Creation');
  console.log(chalk.cyan('Value:'), ethers.formatEther(tx.value), 'ETH');
  console.log(chalk.cyan('Network:'), network.name);
  
  console.log('\n' + chalk.cyan('Result:'), 
    result.success ? chalk.green('✓ Success') : chalk.red('✗ Failed')
  );
  
  if (result.error) {
    console.log(chalk.red('Error:'), result.error);
  }
  
  if (result.returnData && result.returnData !== '0x') {
    console.log(chalk.cyan('Return Data:'), result.returnData);
  }
  
  if (result.logs.length > 0) {
    console.log(chalk.cyan('Logs:'), result.logs.length);
    result.logs.forEach((log, index) => {
      console.log(`  ${index + 1}. Address: ${log.address}`);
      console.log(`     Topics: ${log.topics.join(', ')}`);
      console.log(`     Data: ${log.data}`);
    });
  }
} 