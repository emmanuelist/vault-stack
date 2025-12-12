# 🏦 Vault Stack

A decentralized time-locked vault system built on the Stacks blockchain that allows users to lock STX tokens and earn interest based on the duration of their lock period. Built with Clarity smart contracts and a modern React frontend.

[![Stacks](https://img.shields.io/badge/Stacks-Blockchain-5546FF?style=for-the-badge&logo=stacks&logoColor=white)](https://www.stacks.co/)
[![Clarity](https://img.shields.io/badge/Clarity-Smart%20Contract-5546FF?style=for-the-badge)](https://clarity-lang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🌐 Live Deployment

**Mainnet Contract**: `SPHB047A30W99178TR7KE0784C2GV22070JTKX8.vault-stack`

**Explorer**: [View on Stacks Explorer](https://explorer.hiro.so/txid/0xdde52b62d670f4903ddc664a788176f27b1083e54b9f58ecb298aff02c5356e6?chain=mainnet)

## ✨ Features

### Smart Contract Features

- **Time-Locked Vaults**: Create secure vaults with customizable lock durations (minimum 7 days)
- **Interest Earning**: Earn 5% APR on locked STX tokens
- **Emergency Withdrawals**: Option to withdraw early (forfeits interest)
- **Multiple Vaults**: Create and manage up to 50 vaults per user
- **Real-Time Tracking**: Monitor vault status, remaining time, and earned interest
- **Clarity 3**: Built with the latest Clarity version for enhanced security

### Frontend Features

- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Wallet Integration**: Seamless connection with Leather, Xverse, and other Stacks wallets
- **Real-Time Updates**: Live vault status and transaction monitoring
- **Activity Feed**: Complete transaction history with detailed logs
- **Admin Dashboard**: Contract management and funding capabilities
- **Responsive Design**: Works flawlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Stacks Wallet** - [Leather](https://leather.io/) or [Xverse](https://www.xverse.app/) recommended
- **STX tokens** for transactions (mainnet or testnet)
- **Clarinet** (optional, for local development) - [Install Guide](https://docs.hiro.so/clarinet/installation)

### Installation

```bash
# Clone the repository
git clone https://github.com/emmanuelist/vault-stack.git
cd vault-stack

# Install root dependencies (for testing)
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Running Locally

#### Frontend Development Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

#### Testing Smart Contracts

```bash
# From the root directory
npm test

# Run tests with coverage report
npm run test:report

# Watch mode for continuous testing
npm run test:watch
```

#### Check Contract (Clarinet)

```bash
clarinet check
```

## 📖 How It Works

### Creating a Vault

1. **Connect Wallet**: Connect your Stacks wallet (mainnet/testnet)
2. **Choose Amount**: Select the amount of STX to lock
3. **Set Duration**: Choose lock duration (7 days minimum)
   - Pre-configured options: 7 days, 30 days, 90 days, 1 year
   - Custom duration support
4. **Review & Create**: Review details including estimated interest
5. **Confirm Transaction**: Sign the transaction in your wallet
6. **Track Vault**: Monitor your vault in "My Vaults" page

### Interest Calculation

Interest is calculated using a simple formula:

```
Interest = (Amount × Rate × Duration) / (10000 × Seconds_Per_Year)
```

- **Annual Rate**: 5% (500 basis points)
- **Prorated**: Interest is calculated proportionally to lock duration
- **Example**: Locking 1000 STX for 90 days earns ~12.32 STX

### Withdrawing from a Vault

#### Normal Withdrawal
- Available after lock period expires
- Receive: Principal + Interest

#### Emergency Withdrawal
- Available anytime
- Receive: Principal only (interest forfeited)
- Use for urgent liquidity needs

## 🏗️ Project Structure

```
vault-stack/
├── contracts/
│   └── vault-stack.clar          # Main Clarity smart contract
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── vault/           # Vault-specific components
│   │   │   ├── activity/        # Activity feed components
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   │   ├── api.ts          # API utilities
│   │   │   ├── contract.ts     # Contract interactions
│   │   │   ├── wallet.ts       # Wallet utilities
│   │   │   └── stacks-utils.ts # Stacks helpers
│   │   └── pages/              # Application pages
│   └── public/                  # Static assets
├── tests/
│   └── vault-stack.test.ts      # Comprehensive contract tests
├── settings/                     # Network configurations
├── Clarinet.toml                # Clarinet configuration
└── package.json                 # Root dependencies
```

## 🔧 Technology Stack

### Smart Contract
- **Clarity 3**: Smart contract language for Stacks
- **Clarinet SDK**: Development and testing framework
- **Vitest**: Modern testing framework

### Frontend
- **React 18.3**: UI library
- **TypeScript 5.8**: Type-safe development
- **Vite 5.4**: Fast build tool
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible UI components
- **Stacks.js**: Stacks blockchain integration
  - `@stacks/connect`: Wallet authentication
  - `@stacks/transactions`: Transaction building
  - `@stacks/network`: Network configuration
- **React Router 6.30**: Client-side routing
- **React Query 5.83**: Server state management
- **React Hook Form**: Form management
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run with coverage and cost analysis
npm run test:report

# Watch mode for development
npm run test:watch
```

### Test Coverage

- ✅ Vault creation with various durations
- ✅ Interest calculation accuracy
- ✅ Normal and emergency withdrawals
- ✅ Multi-vault management
- ✅ Access control and authorization
- ✅ Edge cases and error handling
- ✅ Contract balance tracking

## 🔐 Security Features

- **Access Control**: Only vault owners can withdraw their funds
- **Validation**: Comprehensive input validation for all operations
- **Time-Lock Enforcement**: Vaults cannot be withdrawn before unlock time (except emergency)
- **Interest Protection**: Early withdrawals forfeit interest earnings
- **Single Withdrawal**: Prevents double-spending with withdrawal flag
- **Contract Funding**: Admin-only contract funding mechanism

## 📚 Smart Contract API

### Public Functions

#### `create-vault`
```clarity
(create-vault (amount uint) (lock-duration uint))
```
Creates a new time-locked vault.
- **Parameters**: amount (STX), lock-duration (seconds)
- **Returns**: vault-id
- **Minimum Duration**: 604,800 seconds (7 days)

#### `withdraw-from-vault`
```clarity
(withdraw-from-vault (vault-id uint))
```
Withdraws principal + interest after lock period.
- **Parameters**: vault-id
- **Returns**: total amount withdrawn

#### `emergency-withdraw`
```clarity
(emergency-withdraw (vault-id uint))
```
Withdraws principal only (forfeits interest).
- **Parameters**: vault-id
- **Returns**: principal amount

#### `fund-contract`
```clarity
(fund-contract (amount uint))
```
Funds contract for interest payments (admin only).
- **Parameters**: amount (STX)
- **Returns**: success

### Read-Only Functions

#### `get-vault`
Returns vault details by ID.

#### `get-user-vaults`
Returns list of vault IDs for a user.

#### `get-vault-status`
Returns comprehensive vault status including:
- Owner, amount, times
- Lock status and remaining time
- Interest earned
- Withdrawal status

#### `calculate-interest`
Calculates interest for given amount and duration.

#### `get-total-deposits`
Returns total STX locked in all vaults.

#### `get-contract-balance`
Returns current contract STX balance.

## 🎨 Frontend Pages

- **Home**: Overview and quick stats
- **Create Vault**: Vault creation wizard
- **My Vaults**: Personal vault dashboard
- **Vault Detail**: Individual vault management
- **Activity**: Transaction history
- **Admin**: Contract administration (owner only)

## 🌍 Network Configuration

The application supports multiple networks:

- **Mainnet**: Production environment
- **Testnet**: Testing with test tokens
- **Devnet**: Local development with Clarinet

Configure network in [frontend/src/lib/stacks-config.ts](frontend/src/lib/stacks-config.ts)

## 🛠️ Development

### Smart Contract Development

```bash
# Check contract syntax
clarinet check

# Run contract tests
npm test

# Generate test coverage
npm run test:report
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Output will be in frontend/dist/
```

Deploy the `dist` folder to any static hosting service (Vercel, Netlify, etc.)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC License

## 🙏 Acknowledgments

- **Stacks Foundation** for the blockchain infrastructure
- **Hiro Systems** for Clarinet and development tools
- **shadcn** for the beautiful UI components

## 🔮 Roadmap

- [ ] Multi-token support (SIP-010 fungible tokens)
- [ ] NFT collateralization
- [ ] Dynamic interest rates based on lock duration
- [ ] Vault sharing and delegation features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

---

**Mainnet Contract**: `SPHB047A30W99178TR7KE0784C2GV22070JTKX8.vault-stack`
