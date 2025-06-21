export interface AnvilConfig {
  port: number;
  host: string;
  forkUrl?: string;
  forkBlockNumber?: number;
  gasLimit?: number;
  blockTime?: number;
  accounts?: number;
  balance?: string;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: string;
  returnData: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
  error?: string;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  gas: string;
  gasPrice: string;
  nonce: number;
  blockNumber?: number;
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  blockExplorer?: string;
}

export interface StateInspection {
  balance: string;
  nonce: number;
  code: string;
  storage?: Record<string, string>;
}

export interface ForkOptions {
  network: string;
  blockNumber?: number;
  rpcUrl?: string;
}

export interface SimulateOptions {
  transactionHash: string;
  fork: ForkOptions;
  gasLimit?: number;
  gasPrice?: string;
} 