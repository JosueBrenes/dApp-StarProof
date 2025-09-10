"use client";

import React, { useState } from 'react';
import { useWallet } from '@/components/modules/auth/hooks/wallet.hook';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Copy, 
  Check, 
  Globe,
  Shield,
  Clock,
  Info,
  ExternalLink
} from 'lucide-react';

export function Profile() {
  const { isConnected, walletAddress } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };


  const walletInfo = {
    network: 'Stellar Testnet',
    networkUrl: 'https://horizon-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    connectedAt: new Date().toLocaleString()
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Your wallet information and connection details</p>
        </div>

        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Wallet Connected</h2>
            <p className="text-gray-600 mb-6">
              Connect your Stellar wallet to view your profile information and manage your account.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Connect Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Your wallet information and connection details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {walletAddress?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Stellar Wallet</h2>
                  <p className="text-gray-600">Connected to StarProof dApp</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Connected
                  </Badge>
                  <Badge variant="outline">Testnet</Badge>
                  <Badge variant="outline">Verified</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Wallet Details */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Wallet Details
              </h3>
            </div>

            <div className="space-y-6">
              {/* Public Key */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                  <Info className="w-4 h-4 mr-1" />
                  Public Key
                </label>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                  <code className="flex-1 text-sm text-gray-900 font-mono break-all">
                    {walletAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(walletAddress!)}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your Stellar public key used for identification and transactions
                </p>
              </div>

              <Separator />

              {/* Network Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <Globe className="w-4 h-4 mr-1" />
                    Network
                  </label>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-800">{walletInfo.network}</p>
                    <p className="text-xs text-orange-600 mt-1">Development environment</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <Shield className="w-4 h-4 mr-1" />
                    Security
                  </label>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">Signature Auth</p>
                    <p className="text-xs text-green-600 mt-1">Wallet-signed authentication</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Technical Details */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Network Configuration
                </label>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Horizon URL</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs text-gray-800 bg-white px-2 py-1 rounded">
                        horizon-testnet.stellar.org
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(walletInfo.networkUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Network Passphrase</span>
                    <code className="text-xs text-gray-800 bg-white px-2 py-1 rounded max-w-xs truncate">
                      {walletInfo.passphrase}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Connection Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Connection Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connected Since</span>
                <span className="text-sm text-gray-900">Just now</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network</span>
                <Badge variant="outline">Testnet</Badge>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                <Wallet className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </Card>

          {/* Help & Support */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Having issues with your wallet connection or need assistance?
              </p>
              
              <Button variant="outline" className="w-full justify-start">
                <Info className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}