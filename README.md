# ETH CLI - Anvil Wrapper

A powerful CLI wrapper around Anvil (Foundry's local Ethereum node) that simplifies complex Ethereum development tasks like forking mainnet, simulating transactions, and inspecting onchain state.

## Features

- 🚀 **One-line transaction simulation** on forked networks
- 🔍 **State inspection** for contracts and addresses
- 🌐 **Multi-network support** (mainnet, testnets, L2s)
- ⚡ **Fast setup** with automatic Anvil management
- 🎯 **Developer-friendly** output and error handling

## Installation

### Prerequisites

- Node.js 18+ 
- Foundry (for Anvil)
- npm or yarn

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install ETH CLI

```bash
npm install -g eth-cli
```

Or clone and install locally:

```bash
git clone <repository-url>
cd eth-cli
npm install
npm run build
npm link
```

## Usage

### Simulate Transactions

Simulate any transaction from mainnet or testnets:

```bash
# Simulate a transaction on mainnet fork
eth-cli simulate --tx 0x123... --fork mainnet

# Simulate with specific block number
eth-cli simulate --tx 0x123... --fork mainnet --block 18000000

# Custom gas settings
eth-cli simulate --tx 0x123... --fork mainnet --gas-limit 500000 --gas-price 20
```

### Fork Networks

Start Anvil in fork mode for development:

```bash
# Fork mainnet
eth-cli fork --network mainnet

# Fork with specific block
eth-cli fork --network mainnet --block 18000000

# Keep running for development
eth-cli fork --network mainnet --keep

# Custom port and settings
eth-cli fork --network goerli --port 8546 --gas-limit 50000000
```

### Inspect State

Inspect contract state and balances:

```bash
# Inspect an address
eth-cli inspect --address 0x123... --fork mainnet

# Inspect specific storage slot
eth-cli inspect --address 0x123... --fork mainnet --slot 0x0

# Inspect on specific block
eth-cli inspect --address 0x123... --fork mainnet --block 18000000
```

## Supported Networks

- **mainnet** - Ethereum Mainnet
- **goerli** - Goerli Testnet
- **sepolia** - Sepolia Testnet
- **polygon** - Polygon Mainnet
- **arbitrum** - Arbitrum One
- **optimism** - Optimism

## Examples

### Debug a Failed Transaction

```bash
# Simulate a failed transaction to understand why it failed
eth-cli simulate --tx 0xabc... --fork mainnet --block 18000000
```

### Test Contract Interactions

```bash
# Fork mainnet and keep running
eth-cli fork --network mainnet --keep

# In another terminal, inspect contract state
eth-cli inspect --address 0xdef... --fork mainnet
```

### Development Workflow

```bash
# 1. Fork mainnet for development
eth-cli fork --network mainnet --keep

# 2. Your development tools can now connect to localhost:8545
# 3. Test your contracts against real mainnet state
# 4. Simulate transactions before deploying
```

## Configuration

### Environment Variables

- `ALCHEMY_API_KEY` - Your Alchemy API key for better RPC performance (default: demo key)
- `ANVIL_PORT` - Default port for Anvil (default: 8545)
- `ANVIL_HOST` - Default host for Anvil (default: 127.0.0.1)

### Setting Up Alchemy API Key

For better performance and reliability, set your Alchemy API key:

```bash
# Set environment variable
export ALCHEMY_API_KEY=your_alchemy_api_key_here

# Or use it inline
ALCHEMY_API_KEY=your_key eth-cli simulate --tx 0x123... --fork mainnet
```

**Benefits of using your own API key:**
- Higher rate limits
- Better performance
- More reliable connections
- Access to archive data

### Custom RPC URLs

You can use custom RPC URLs for better performance:

```bash
# Use your own RPC endpoint
eth-cli simulate --tx 0x123... --fork mainnet --rpc-url https://your-rpc.com
```

## Development

### Setup

```bash
git clone <repository-url>
cd eth-cli
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

### Lint and Format

```bash
npm run lint
npm run format
```

## Architecture

The CLI is built with TypeScript and organized into:

- **Commands** (`src/commands/`) - CLI command implementations
- **Utils** (`src/utils/`) - Anvil management and network utilities
- **Types** (`src/types/`) - TypeScript type definitions

### Key Components

- `AnvilManager` - Manages Anvil process lifecycle
- `NetworkConfig` - Network configurations and RPC endpoints
- Command handlers for simulate, fork, and inspect operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Anvil Not Found

Make sure Foundry is installed:

```bash
foundryup
which anvil
```

### Port Already in Use

Use a different port:

```bash
eth-cli fork --network mainnet --port 8546
```

### RPC Timeout

Use a faster RPC endpoint or increase timeout settings.

### Permission Denied

On Linux/macOS, you might need to make the script executable:

```bash
chmod +x dist/index.js
``` 