# AgentiFi

AgentiFi is an advanced AI-powered toolkit for interacting with the Mantle Network through a team of specialized AI agents. Each agent has unique capabilities and works together to provide a seamless blockchain interaction experience.

## Meet The Team

# The AgentiFi Agents

## Account Guardian
![Account Guardian](./src/frontend/public/assets/char1.png)
The Account Guardian specializes in account creation and management:
- Creates and deploys accounts
- Manages account deployments and upgrades
- Monitors account security and permissions

## Token Sentinel
![Token Sentinel](./src/frontend/public/assets/char2.png)
The Token Sentinel tracks and manages token operations:
- Monitors token balances across multiple assets
- Tracks token transfers and approvals
- Provides real-time balance updates

## Swap Sage
![Swap Sage](./src/frontend/public/assets/char3.png)
The Swap Sage handles all token exchange operations:
- Executes token swaps with optimal rates
- Monitors liquidity pools
- Suggests optimal swap paths
- Handles slippage protection

## Transfer Oracle
![Transfer Oracle](./src/frontend/public/assets/char4.png)
The Transfer Oracle manages secure token transfers:
- Executes safe token transfers
- Simulates transactions before execution
- Monitors transaction status
- Verifies transaction completion

## Network Seer
![Network Seer](./src/frontend/public/assets/char5.png)
The Network Seer provides network insights:
- Monitors network status and metrics
- Tracks block production and finality
- Reports network performance
- Alerts on network issues

## Contract Sage
![Contract Sage](./src/frontend/public/assets/char6.png)
The Contract Sage handles smart contract interactions:
- Analyzes contract code and storage
- Monitors contract states
- Executes contract interactions
- Validates contract security

## How It Works

1. **User Input**: Users interact with the system through natural language commands
2. **Agent Selection**: The system automatically routes requests to the appropriate specialist agent
3. **Execution**: The selected agent processes the request using its specialized capabilities
4. **Collaboration**: Agents can work together on complex tasks requiring multiple specialties
5. **Response**: Results are returned in a clear, user-friendly format


## Features

### Account Management
- Create & deploy accounts
- Account status monitoring
- Multi-account support

### Token Operations
- Balance checking
- Token transfers
- Token approvals

### DeFi Integration
- Token swaps
- Liquidity provision
- Yield opportunities

### Network Interaction
- RPC method support
- Block exploration
- Transaction monitoring

## Environment Setup

Create a `.env` file with:

```env
# Your Mantle Network wallet private key (required)
MANTLE_PRIVATE_KEY=your_private_key

# Your Mantle Network public address (required)
PUBLIC_ADDRESS=your_public_address

# Your Anthropic API key (required)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Your Mantle Network RPC URL (required)
RPC_URL=your_rpc_url

# API security key (required)
API_KEY=your_api_key
```

## Security

- Each agent operates within defined security boundaries
- All sensitive operations require explicit user confirmation
- Transaction simulation before execution
- Continuous security monitoring
