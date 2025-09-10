"use client";

import { useState, useCallback } from 'react';
import { useWallet } from '@/components/modules/auth/hooks/wallet.hook';

interface ApiKeyData {
  key: string;
  createdAt: string;
}

export function useApiKey() {
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress, signMessage, isConnected } = useWallet();

  const generateApiKey = useCallback(async () => {
    if (!isConnected || !walletAddress) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sign a message with the wallet to authenticate
      const message = `Generate API key for ${walletAddress} at ${Date.now()}`;
      const signature = await signMessage(message);

      // Call StarProof API to generate the API key
      const response = await fetch('/api/generate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: walletAddress,
          signature: signature.signedMessage,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      const newApiKey: ApiKeyData = {
        key: data.apiKey,
        createdAt: new Date().toISOString(),
      };

      setApiKey(newApiKey);
      
      // Store in localStorage for persistence
      localStorage.setItem('starproof-api-key', JSON.stringify(newApiKey));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, signMessage, isConnected]);

  const loadApiKey = useCallback(() => {
    try {
      const stored = localStorage.getItem('starproof-api-key');
      if (stored) {
        const parsedKey: ApiKeyData = JSON.parse(stored);
        setApiKey(parsedKey);
      }
    } catch (err) {
      console.error('Failed to load API key from storage:', err);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey(null);
    localStorage.removeItem('starproof-api-key');
  }, []);

  return {
    apiKey,
    isLoading,
    error,
    generateApiKey,
    loadApiKey,
    clearApiKey,
  };
}