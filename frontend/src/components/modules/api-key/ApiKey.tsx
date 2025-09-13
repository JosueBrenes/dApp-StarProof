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
  CheckCircle,
  Download,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export function ApiKey() {
  const { isConnected } = useWallet();
  const { 
    userProfile, 
    generateApiKey, 
    regenerateApiKey, 
    deleteApiKey
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
          <h1 className="text-3xl font-bold text-foreground">
            API Key Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage your StarProof API keys
          </p>
        </div>

        <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Wallet Connection Required
            </h2>
            <p className="text-muted-foreground mb-6">
              You need to connect your Stellar wallet to generate and manage API
              keys for StarProof services.
            </p>
            <Button className="bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all">
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
          <h1 className="text-3xl font-bold text-foreground">
            API Key Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage your StarProof API keys
          </p>
        </div>
        <Badge variant="outline" className="text-[#1B6BFF] border-[#1B6BFF]/30 bg-[#1B6BFF]/10 backdrop-blur-sm rounded-2xl">
          <Shield className="w-3 h-3 mr-1" />
          Secure
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main API Key Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Your API Key
              </h2>
              {hasApiKey && (
                <Badge className="bg-green-400/20 text-green-400 border-green-400/30 backdrop-blur-sm rounded-2xl">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>

            {!hasApiKey ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#1B6BFF]/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1B6BFF]/20">
                  <Key className="w-8 h-8 text-[#1B6BFF]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No API Key Generated
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Generate a secure API key to access StarProof services. The
                  key will be authenticated with your wallet signature.
                </p>
                <Button
                  onClick={handleGenerateApiKey}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all"
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
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    API Key
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                    <code className="flex-1 text-sm font-mono text-foreground min-w-0 break-all">
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
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Keep your API key secure and never share it publicly
                  </p>
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Created At
                    </label>
                    <p className="text-sm text-foreground bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleString() : 'Just created'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Status
                    </label>
                    <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                      <Badge className="bg-green-400/20 text-green-400 border-green-400/30 backdrop-blur-sm rounded-2xl">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active & Valid
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <Button
                    onClick={handleRegenerateApiKey}
                    disabled={isRegenerating}
                    variant="outline"
                    className="border-[#1B6BFF]/30 text-[#1B6BFF] hover:bg-[#1B6BFF]/10 backdrop-blur-sm rounded-2xl"
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
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 backdrop-blur-sm rounded-2xl"
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

                  <Button onClick={downloadEnvFile} variant="outline" className="border-white/20 text-foreground hover:bg-white/5 backdrop-blur-sm rounded-2xl">
                    <Download className="w-4 h-4 mr-2" />
                    Download .env
                  </Button>
                </div>
              </div>
            )}

            {generatedKey && (
              <div className="mt-4 p-4 bg-green-400/10 backdrop-blur-sm border border-green-400/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-400">Success</h4>
                    <p className="text-sm text-green-400/80 mt-1">
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
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Information
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Wallet Authenticated
                  </p>
                  <p className="text-muted-foreground">
                    Keys are generated using your wallet signature
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Locally Stored</p>
                  <p className="text-muted-foreground">
                    Keys are stored in your browser only
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Revocable</p>
                  <p className="text-muted-foreground">
                    You can clear and regenerate keys anytime
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* API Status */}
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              API Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Service</span>
                <Badge className="bg-green-400/20 text-green-400 border-green-400/30 backdrop-blur-sm rounded-2xl">Online</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Endpoint</span>
                <code className="text-xs bg-white/5 backdrop-blur-sm px-2 py-1 rounded border border-white/10 text-foreground">
                  {process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '').replace(/\/v1$/, '') : 'localhost:8080'}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <code className="text-xs bg-white/5 backdrop-blur-sm px-2 py-1 rounded border border-white/10 text-foreground">
                  v1
                </code>
              </div>
            </div>
          </Card>

          {/* Help */}
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Need Help?
            </h3>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Check out our documentation for detailed API usage examples and
                integration guides.
              </p>

              <Button variant="outline" className="w-full justify-start border-white/20 text-foreground hover:bg-white/5 backdrop-blur-sm rounded-2xl">
                View Documentation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
