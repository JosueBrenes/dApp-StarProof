"use client";

import React, { useState } from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "@/components/modules/dashboard/Dashboard";
import { Profile } from "@/components/modules/profile/Profile";
import { ApiKey } from "@/components/modules/api-key/ApiKey";
import { CreateCredential } from "@/components/modules/credentials/CreateCredential";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

type SectionType = "dashboard" | "profile" | "api-key" | "credentials";

export function DashboardLayout() {
  const { isConnected, handleConnect } = useWallet();
  const [activeSection, setActiveSection] = useState<SectionType>("dashboard");

  // If not connected, show connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="StarProof Logo" className="w-16 h-16" />
          </div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              StarProof dApp
            </h1>
            <p className="text-gray-600">
              Connect your Stellar wallet to access the dashboard and generate
              API keys
            </p>
          </div>

          <Button
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Stellar Wallet
          </Button>

          <div className="mt-6 text-xs text-gray-500">
            <p>Supports Freighter, Albedo, xBull, Lobstr, and Rabet wallets</p>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <Profile />;
      case "api-key":
        return <ApiKey />;
      case "credentials":
        return <CreateCredential />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <main className="p-6 lg:p-8 pt-16 lg:pt-8">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
