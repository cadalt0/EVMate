import { NetworkConfig } from '../types';

// Alchemy API key - must be set via environment variable
const ALCHEMY_API_KEY = process.env['ALCHEMY_API_KEY'];
if (!ALCHEMY_API_KEY) {
  console.warn('⚠️  Warning: ALCHEMY_API_KEY not set. Using public RPC endpoints which may have rate limits.');
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Ethereum Mainnet',
    rpcUrl: ALCHEMY_API_KEY 
      ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : 'https://eth.llamarpc.com',
    chainId: 1,
    blockExplorer: 'https://etherscan.io',
  },
  goerli: {
    name: 'Goerli Testnet',
    rpcUrl: ALCHEMY_API_KEY 
      ? `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    chainId: 5,
    blockExplorer: 'https://goerli.etherscan.io',
  },
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: ALCHEMY_API_KEY 
      ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    chainId: 11155111,
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  polygon: {
    name: 'Polygon Mainnet',
    rpcUrl: ALCHEMY_API_KEY 
      ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : 'https://polygon-rpc.com',
    chainId: 137,
    blockExplorer: 'https://polygonscan.com',
  },
  arbitrum: {
    name: 'Arbitrum One',
    rpcUrl: ALCHEMY_API_KEY 
      ? `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    blockExplorer: 'https://arbiscan.io',
  },
  optimism: {
    name: 'Optimism',
    rpcUrl: ALCHEMY_API_KEY 
      ? `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : 'https://mainnet.optimism.io',
    chainId: 10,
    blockExplorer: 'https://optimistic.etherscan.io',
  },
};

export function getNetworkConfig(networkName: string): NetworkConfig {
  const network = NETWORKS[networkName.toLowerCase()];
  if (!network) {
    throw new Error(`Unknown network: ${networkName}. Available networks: ${Object.keys(NETWORKS).join(', ')}`);
  }
  return network;
}

export function listNetworks(): string[] {
  return Object.keys(NETWORKS);
}

export function validateNetwork(networkName: string): boolean {
  return networkName.toLowerCase() in NETWORKS;
} 