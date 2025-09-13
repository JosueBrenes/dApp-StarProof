"use client";

import React, { useState } from 'react';
import { useWallet } from '@/components/modules/auth/hooks/wallet.hook';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  User, 
  Key, 
  LogOut, 
  Wallet,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  activeSection: 'dashboard' | 'profile' | 'api-key' | 'credentials';
  onSectionChange: (section: 'dashboard' | 'profile' | 'api-key' | 'credentials') => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { isConnected, walletAddress, handleDisconnect } = useWallet();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Stats'
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
      description: 'Wallet Information'
    },
    {
      id: 'api-key' as const,
      label: 'API Key',
      icon: Key,
      description: 'Generate & Manage'
    },
    {
      id: 'credentials' as const,
      label: 'Credentials',
      icon: CreditCard,
      description: 'Create & Issue'
    }
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-xl border-r border-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="StarProof Logo" className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">StarProof</h1>
            <p className="text-sm text-muted-foreground">dApp Dashboard</p>
          </div>
        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-[#1B6BFF]/20 to-[#8F43FF]/20 text-foreground border border-[#1B6BFF]/30 shadow-lg backdrop-blur-sm' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground backdrop-blur-sm'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs opacity-70">{item.description}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleDisconnect}
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background/80 backdrop-blur-xl border-white/20 text-foreground hover:bg-background/90 shadow-xl rounded-2xl"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-80 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}