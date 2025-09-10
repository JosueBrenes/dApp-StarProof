# StarProof dApp

A decentralized application (dApp) that allows users to connect their Stellar wallet and generate API keys for the StarProof API service. Built with Next.js 15.5.0 and Stellar Wallet Kit integration.

## 🚀 Features

- **Stellar Wallet Integration**: Connect with popular Stellar wallets (Freighter, Albedo, xBull, Lobstr, Rabet)
- **API Key Generation**: Generate secure API keys authenticated with wallet signatures
- **Key Management**: View, regenerate, and manage your API keys
- **Environment Configuration**: Auto-generate environment variables for easy API integration
- **Testnet Support**: Full support for Stellar Testnet operations
- **Responsive Design**: Modern, responsive UI built with Tailwind CSS

## 🛠 Technology Stack

- **Frontend**: Next.js 15.5.0 with TypeScript
- **Blockchain**: Stellar Network (Testnet)
- **Wallet Integration**: @creit.tech/stellar-wallets-kit
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Turbopack

## 📋 Prerequisites

Before running the application, make sure you have:

- Node.js 18+ installed
- A Stellar wallet (Freighter, Albedo, etc.)
- The StarProof API backend running on `http://localhost:8080`

## 🚀 Getting Started

1. **Clone and navigate to the project**:
   ```bash
   cd dApp-StarProof/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## 📱 How to Use

1. **Connect Your Wallet**: Click "Connect Wallet" and select your preferred Stellar wallet
2. **Generate API Key**: Once connected, click "Generate API Key" to create a new key
3. **Copy Configuration**: Use the generated environment variables in your projects
4. **Use the API**: Make requests to StarProof API using your generated key

### Example API Usage

```bash
# Test API connection
curl -X GET http://localhost:8080/v1/health \
  -H "Authorization: Bearer YOUR_API_KEY"

# Access templates
curl -X GET http://localhost:8080/v1/templates \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### JavaScript Integration

```javascript
const response = await fetch('http://localhost:8080/v1/templates', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
```

## 🏗 Project Structure

```
src/
├── app/                          # Next.js App Router
├── components/
│   └── modules/
│       └── auth/
│           ├── helpers/          # Wallet configuration
│           ├── hooks/            # Wallet integration hooks
│           └── ui/               # UI components
├── hooks/                        # Custom React hooks
├── providers/                    # React context providers
├── @types/                       # TypeScript type definitions
└── config/                       # Configuration files
```

## 🔐 Security Features

- **Cryptographic Authentication**: API keys are generated using wallet signatures
- **Secure Key Storage**: Keys stored locally in browser storage
- **Wallet Fallback**: Automatic fallback for wallets without signMessage support
- **Network Isolation**: Testnet-only operations for development safety

## 🌐 Supported Wallets

- **Freighter**: Full support with message signing
- **Albedo**: Supported with fallback authentication
- **xBull**: Full support with message signing
- **Lobstr**: Supported with fallback authentication
- **Rabet**: Supported with fallback authentication

## ⚙️ Environment Configuration

The dApp automatically generates environment variables for your projects:

```bash
# StarProof API Configuration
STARPROOF_API_KEY=your_generated_key_here
STARPROOF_API_URL=http://localhost:8080/v1
```

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**: Ensure your wallet extension is installed and unlocked
2. **API Key Generation Failed**: Check that the StarProof API backend is running
3. **Signature Failed**: Some wallets may not support message signing, fallback authentication will be used

### Development Issues

- **Build Errors**: Run `npm run lint` to check for TypeScript/ESLint errors
- **Port Conflicts**: Change the dev server port using `npm run dev -- --port 3001`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run lint` and `npm run build`
5. Submit a pull request

## 📄 License

This project is part of the StarProof ecosystem. Please refer to the main project license.
