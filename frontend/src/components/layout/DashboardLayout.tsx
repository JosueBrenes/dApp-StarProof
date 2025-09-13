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
import Aurora from "@/components/Aurora";
import { Particles } from "@/components/magicui/particles";

type SectionType = "dashboard" | "profile" | "api-key" | "credentials";

export function DashboardLayout() {
  const { isConnected, handleConnect } = useWallet();
  const [activeSection, setActiveSection] = useState<SectionType>("dashboard");

  // If not connected, show connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Background layers */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
          <Aurora />
          <Particles
            className="absolute inset-0 z-0"
            quantity={60}
            staticity={40}
            ease={70}
            size={0.4}
            vx={0}
            vy={0}
            color="#ffffff"
          />
        </div>

        {/* Background effects for connection section */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#1B6BFF]/25 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#8F43FF]/25 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent [mask-image:radial-gradient(350px_200px_at_50%_0%,#000_40%,transparent_80%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_23%,rgba(255,255,255,.06)_24%,transparent_25%),linear-gradient(to_bottom,transparent_0,transparent_23%,rgba(255,255,255,.06)_24%,transparent_25%)] bg-[size:44px_44px] opacity-40" />
          </div>

          <div className="relative z-10 bg-background/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <img src="/logo.png" alt="StarProof Logo" className="w-16 h-16" />
            </div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                StarProof dApp
              </h1>
              <p className="text-muted-foreground">
                Connect your Stellar wallet to access the dashboard and generate
                API keys
              </p>
            </div>

            <Button
              onClick={handleConnect}
              className="bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1B6BFF]/40 w-full"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Stellar Wallet
            </Button>

            <div className="mt-6 text-xs text-muted-foreground/70">
              <p>Supports Freighter, Albedo, xBull, Lobstr, and Rabet wallets</p>
            </div>
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
        <Aurora />
        <Particles
          className="absolute inset-0 z-0"
          quantity={60}
          staticity={40}
          ease={70}
          size={0.4}
          vx={0}
          vy={0}
          color="#ffffff"
        />
      </div>

      {/* Main container */}
      <div className="relative z-10 min-h-screen flex">
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
    </div>
  );
}
