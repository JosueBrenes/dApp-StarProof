"use client";

import React from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useApiKey } from "@/hooks/useApiKey.hook";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Key,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

export function Dashboard() {
  const { isConnected, walletAddress } = useWallet();
  const { apiKey } = useApiKey();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const recentActivities = [
    {
      action: isConnected ? "Wallet Connected" : "No Recent Activity",
      time: isConnected ? "Just now" : "-",
      icon: isConnected ? CheckCircle : AlertCircle,
      color: isConnected ? "text-green-600" : "text-gray-400",
    },
    ...(apiKey
      ? [
          {
            action: "API Key Generated",
            time: "Recently",
            icon: CheckCircle,
            color: "text-green-600",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your StarProof dApp status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Live
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Wallet Information
            </h2>
            <Wallet className="w-5 h-5 text-gray-400" />
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Public Key
                </label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                  <code className="text-sm text-gray-900 font-mono">
                    {formatAddress(walletAddress!)}
                  </code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Network</p>
                  <p className="text-sm text-gray-500">Stellar Testnet</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Connected</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No wallet connected</p>
              <p className="text-sm text-gray-400 mt-1">
                Connect your Stellar wallet to view information
              </p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}

            {recentActivities.length === 1 && !isConnected && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  Connect your wallet to see activity
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <Key className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Generate API Key
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              Create a new API key for StarProof services
            </p>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              Go to API Key
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <User className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-sm font-semibold text-green-900 mb-1">
              View Profile
            </h3>
            <p className="text-xs text-green-700 mb-3">
              Check your wallet details and connection
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
            >
              View Profile
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <Activity className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-sm font-semibold text-purple-900 mb-1">
              API Documentation
            </h3>
            <p className="text-xs text-purple-700 mb-3">
              Learn how to integrate StarProof API
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              View Docs
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
