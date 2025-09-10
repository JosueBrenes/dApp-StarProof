"use client";

import { useEffect, useState } from 'react';
import { useWalletKit } from '@/hooks/useWalletKit';
import { useApiKey } from '@/lib/use-api-key';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const { isConnected, walletAddress, walletName, handleConnect, handleDisconnect } = useWalletKit();
  const { apiKey, isLoading, error, generateApiKey, loadApiKey, clearApiKey } = useApiKey();
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadApiKey();
    }
  }, [isConnected, loadApiKey]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  const generateEnvContent = () => {
    if (!apiKey) return '';
    return `# StarProof API Configuration
STARPROOF_API_KEY=${apiKey.key}
STARPROOF_API_URL=http://localhost:8080/v1
`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">StarProof</h1>
            <p className="text-gray-600">Connect your Stellar wallet to generate an API key</p>
          </div>
          
          <button
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">StarProof Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your API access</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Disconnect
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Wallet Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Public Key</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 font-mono">
                    {formatPublicKey(walletAddress!)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(walletAddress!)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Connected to Testnet</span>
              </div>
            </div>
          </div>

          {/* API Key Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Key</h2>
            
            {!apiKey ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Generate an API key to access StarProof services</p>
                <button
                  onClick={generateApiKey}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Generating...' : 'Generate API Key'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Your API Key</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 font-mono min-w-0 break-all">
                      {showKey ? apiKey.key : '•'.repeat(32)}
                    </code>
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="p-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(apiKey.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={generateApiKey}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm py-2 px-3 rounded transition-colors"
                  >
                    {isLoading ? 'Generating...' : 'Regenerate'}
                  </button>
                  <button
                    onClick={clearApiKey}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Environment Configuration */}
        {apiKey && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Configuration</h2>
            <p className="text-gray-600 mb-4">Copy this to your .env file to use the API:</p>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                {generateEnvContent()}
              </pre>
              <button
                onClick={() => copyToClipboard(generateEnvContent())}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* API Usage Example */}
        {apiKey && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Example</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Test API Connection</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto mt-2">
{`curl -X GET http://localhost:8080/v1/health \\
  -H "Authorization: Bearer ${apiKey.key}"`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">JavaScript Example</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto mt-2">
{`const response = await fetch('http://localhost:8080/v1/templates', {
  headers: {
    'Authorization': 'Bearer ${apiKey.key}',
    'Content-Type': 'application/json'
  }
});`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}