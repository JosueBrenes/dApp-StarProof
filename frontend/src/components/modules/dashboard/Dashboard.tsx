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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Overview of your StarProof dApp status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 backdrop-blur-sm rounded-2xl">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Live
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Wallet Information */}
        <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Wallet Information
            </h2>
            <Wallet className="w-5 h-5 text-muted-foreground" />
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Public Key
                </label>
                <div className="mt-1 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <code className="text-sm text-foreground font-mono">
                    {formatAddress(walletAddress!)}
                  </code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Network</p>
                  <p className="text-sm text-muted-foreground">Stellar Testnet</p>
                </div>
                <Badge className="bg-green-400/20 text-green-400 border-green-400/30 backdrop-blur-sm rounded-2xl">Connected</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No wallet connected</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Connect your Stellar wallet to view information
              </p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Activity
            </h2>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}

            {recentActivities.length === 1 && !isConnected && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to see activity
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 bg-gradient-to-r from-[#1B6BFF]/10 to-[#1B6BFF]/5 backdrop-blur-sm rounded-2xl border border-[#1B6BFF]/20">
            <Key className="w-8 h-8 text-[#1B6BFF] mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Generate API Key
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Create a new API key for StarProof services
            </p>
            <Button size="sm" className="w-full bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl">
              Go to API Key
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-400/10 to-green-400/5 backdrop-blur-sm rounded-2xl border border-green-400/20">
            <User className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">
              View Profile
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Check your wallet details and connection
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-green-400/30 text-green-400 hover:bg-green-400/10 backdrop-blur-sm rounded-2xl"
            >
              View Profile
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#8F43FF]/10 to-[#8F43FF]/5 backdrop-blur-sm rounded-2xl border border-[#8F43FF]/20">
            <Activity className="w-8 h-8 text-[#8F43FF] mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">
              API Documentation
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Learn how to integrate StarProof API
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-[#8F43FF]/30 text-[#8F43FF] hover:bg-[#8F43FF]/10 backdrop-blur-sm rounded-2xl"
            >
              View Docs
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
