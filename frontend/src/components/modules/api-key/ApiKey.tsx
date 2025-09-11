"use client";

import React, { useState } from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useWalletContext } from "@/providers/wallet.provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  Download,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export function ApiKey() {
  const { isConnected } = useWallet();
  const { 
    userProfile, 
    isLoadingUser, 
    generateApiKey, 
    regenerateApiKey, 
    deleteApiKey, 
    refreshUserProfile 
  } = useWalletContext();
  
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerateApiKey = async () => {
    try {
      setIsGenerating(true);
      const newApiKey = await generateApiKey();
      setGeneratedKey(newApiKey);
      setShowKey(true);
      toast.success('API Key generada exitosamente!');
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Error al generar la API Key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      setIsRegenerating(true);
      const newApiKey = await regenerateApiKey();
      setGeneratedKey(newApiKey);
      setShowKey(true);
      toast.success('API Key regenerada exitosamente!');
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast.error('Error al regenerar la API Key');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteApiKey = async () => {
    try {
      setIsDeleting(true);
      await deleteApiKey();
      setGeneratedKey(null);
      setShowKey(false);
      toast.success('API Key eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Error al eliminar la API Key');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('API Key copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error('Error al copiar API Key');
    }
  };

  const hasApiKey = userProfile?.has_api_key || !!generatedKey;
  const apiKeyToShow = generatedKey || userProfile?.api_key;

  const generateEnvContent = () => {
    if (!apiKeyToShow) return "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';
    return `# StarProof API Configuration
STARPROOF_API_KEY=${apiKeyToShow}
STARPROOF_API_URL=${apiUrl}
`;
  };

  const downloadEnvFile = () => {
    const content = generateEnvContent();
    if (!content) {
      toast.error('No API key available to download');
      return;
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env.starproof";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Archivo .env descargado');
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            API Key Management
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and manage your StarProof API keys
          </p>
        </div>

        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Wallet Connection Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to connect your Stellar wallet to generate and manage API
              keys for StarProof services.
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            API Key Management
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and manage your StarProof API keys
          </p>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-200">
          <Shield className="w-3 h-3 mr-1" />
          Secure
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main API Key Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Your API Key
              </h2>
              {hasApiKey && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>

            {!hasApiKey ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No API Key Generated
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Generate a secure API key to access StarProof services. The
                  key will be authenticated with your wallet signature.
                </p>
                <Button
                  onClick={handleGenerateApiKey}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Generate API Key
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* API Key Display */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    API Key
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-sm font-mono text-gray-900 min-w-0 break-all">
                      {showKey ? apiKeyToShow : "•".repeat(32)}
                    </code>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKeyToShow || '')}
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Keep your API key secure and never share it publicly
                  </p>
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleString() : 'Just created'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Status
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active & Valid
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleRegenerateApiKey}
                    disabled={isRegenerating}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    {isRegenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Regenerate Key
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleDeleteApiKey}
                    disabled={isDeleting}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Key
                      </>
                    )}
                  </Button>

                  <Button onClick={downloadEnvFile} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download .env
                  </Button>
                </div>
              </div>
            )}

            {generatedKey && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Success</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your API key has been generated successfully. Make sure to copy it before navigating away.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Information
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    Wallet Authenticated
                  </p>
                  <p className="text-gray-600">
                    Keys are generated using your wallet signature
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Locally Stored</p>
                  <p className="text-gray-600">
                    Keys are stored in your browser only
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Revocable</p>
                  <p className="text-gray-600">
                    You can clear and regenerate keys anytime
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* API Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              API Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service</span>
                <Badge className="bg-green-100 text-green-700">Online</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Endpoint</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '').replace(/\/v1$/, '') : 'localhost:8080'}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  v1
                </code>
              </div>
            </div>
          </Card>

          {/* Help */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Check out our documentation for detailed API usage examples and
                integration guides.
              </p>

              <Button variant="outline" className="w-full justify-start">
                View Documentation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
