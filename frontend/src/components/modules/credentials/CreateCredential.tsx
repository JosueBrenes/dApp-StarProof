"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Sparkles,
  Calendar,
  Tag,
  User,
  Building,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  QrCode,
  Lock,
  Unlock,
  Shield,
  ExternalLink,
  AlertCircle,
  Key,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { apiService, CredentialContract } from "@/services/api.service";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useWalletContext } from "@/providers/wallet.provider";

interface CredentialData {
  holder: string;
  issuedBy: string;
  issuedOn: string;
  expires: string;
  category: string;
  description: string;
}

export function CreateCredential() {
  const { walletAddress } = useWallet();
  const { userProfile, isLoadingUser } = useWalletContext();
  const [credentialData, setCredentialData] = useState<CredentialData>({
    holder: "",
    issuedBy: "StarProof",
    issuedOn: new Date().toLocaleDateString(),
    expires: "",
    category: "",
    description: "",
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdContract, setCreatedContract] =
    useState<CredentialContract | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [userCredentials, setUserCredentials] = useState<CredentialContract[]>(
    []
  );
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [detailCardFlipped, setDetailCardFlipped] = useState(false);

  // Check if user has API key when user profile loads
  useEffect(() => {
    if (userProfile && !userProfile.has_api_key) {
      toast.error("API Key Required", {
        description:
          "You need to generate an API key before creating credentials.",
      });
    }
  }, [userProfile]);

  // Test API connectivity on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const health = await apiService.getHealth();
        if (health.status === "ok" || health.status === "healthy") {
          console.log("✅ API backend is running and accessible");
        } else {
          console.warn("⚠️ API backend responded with status:", health.status);
        }
      } catch (error) {
        console.error(
          "❌ Cannot connect to API backend. Please ensure the backend is running"
        );
        console.error(
          "To start the backend, run: cd StarProof-api && cargo run"
        );
      }
    };

    testApiConnection();
  }, []);

  // Load user credentials when wallet and API key are available
  useEffect(() => {
    const loadUserCredentials = async () => {
      if (walletAddress && userProfile?.has_api_key && userProfile.api_key) {
        try {
          // For now, store credentials locally since we need to implement the API endpoint
          const stored = localStorage.getItem(`credentials_${walletAddress}`);
          if (stored) {
            setUserCredentials(JSON.parse(stored));
          }
        } catch (error) {
          console.error("Error loading user credentials:", error);
        }
      }
    };

    loadUserCredentials();
  }, [walletAddress, userProfile]);

  const handleInputChange = (field: keyof CredentialData, value: string) => {
    setCredentialData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleCardFlip = (credentialId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(credentialId)) {
        newSet.delete(credentialId);
      } else {
        newSet.add(credentialId);
      }
      return newSet;
    });
  };

  const openDetailModal = (credential: any) => {
    setSelectedCredential(credential);
    setDetailCardFlipped(false);
    setShowDetailModal(true);
  };

  const formatIssuerName = (issuer: string): string => {
    if (!issuer) {
      return "StarProof";
    }

    // If it's a Stellar wallet address (starts with G and is 56 characters)
    if (issuer.startsWith("G") && issuer.length === 56) {
      // Return a shortened version with "StarProof" as the main name
      const shortAddress = `${issuer.slice(0, 4)}...${issuer.slice(-4)}`;
      return `StarProof (${shortAddress})`;
    }

    // If it's not a Stellar address, return as is or default
    return issuer || "StarProof";
  };

  const handleCreateCredential = async () => {
    if (!userProfile?.has_api_key || !userProfile.api_key) {
      toast.error("API Key required to create credentials");
      return;
    }

    if (!walletAddress) {
      toast.error("Wallet connection required to create credentials");
      return;
    }

    if (
      !credentialData.holder ||
      !credentialData.category ||
      !credentialData.expires
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);

    try {
      // Step 1: Create credential via API (which will deploy to Stellar in the backend)
      toast.info("Creating credential...", {
        description:
          "Submitting credential data and deploying to Stellar blockchain",
      });

      const result = await apiService.createCredential(
        {
          holder: credentialData.holder,
          category: credentialData.category,
          description: credentialData.description || "",
          expiresAt: credentialData.expires,
          issuerWallet: walletAddress, // Include wallet address
        },
        userProfile.api_key
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to create credential");
      }

      const contract = result.credential;

      // Log the contract data to verify what we're receiving from the backend
      console.log("🔍 Contract data received from backend:", {
        id: contract.id,
        contractAddress: contract.contractAddress,
        transactionHash: contract.transactionHash,
        verificationUrl: contract.verificationUrl,
      });

      // Step 2: Generate QR code from the verification URL provided by the API
      const qrDataUrl = await QRCode.toDataURL(contract.verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setCreatedContract(contract);
      setQrCodeUrl(qrDataUrl);

      // Store credential locally associated with wallet
      if (walletAddress) {
        const existingCredentials = localStorage.getItem(
          `credentials_${walletAddress}`
        );
        const credentials = existingCredentials
          ? JSON.parse(existingCredentials)
          : [];
        const newCredential = {
          ...contract,
          qrCode: qrDataUrl,
          credentialData,
        };
        credentials.unshift(newCredential); // Add to beginning of array
        localStorage.setItem(
          `credentials_${walletAddress}`,
          JSON.stringify(credentials)
        );
        setUserCredentials(credentials);
      }

      // Check if this is a real Stellar deployment (64-character hex transaction hash)
      const isRealStellarData =
        contract.transactionHash &&
        !contract.transactionHash.startsWith("mock_") &&
        contract.transactionHash.length === 64 &&
        /^[a-f0-9]+$/i.test(contract.transactionHash);

      const toastTitle = isRealStellarData
        ? "🎉 Credential Deployed to Stellar Testnet!"
        : "🎉 Credential Created Successfully!";

      const toastDescription = isRealStellarData
        ? `✅ Successfully deployed to Stellar testnet blockchain
📝 Credential ID: ${contract.id}
🔗 Transaction: ${contract.transactionHash.slice(0, 8)}...${contract.transactionHash.slice(-8)}
🌟 Real blockchain deployment - verifiable on Stellar Expert!
📋 Verification URL ready for sharing`
        : `✅ Credential created and ready for verification
📝 ID: ${contract.id.slice(-12)}
⚠️  Mock deployment (backend may not be connected to Stellar)
📋 Verification URL generated`;

      toast.success(toastTitle, {
        description: toastDescription,
        duration: 8000,
        action: isRealStellarData
          ? {
              label: "View on Stellar",
              onClick: () => {
                const stellarUrl = `https://stellar.expert/explorer/testnet/tx/${contract.transactionHash}`;
                console.log("Opening Stellar URL:", stellarUrl);
                window.open(stellarUrl, "_blank");
              },
            }
          : {
              label: "Copy URL",
              onClick: () => {
                navigator.clipboard.writeText(contract.verificationUrl);
                toast.success("Verification URL copied!");
              },
            },
      });

      // Reset form
      setCredentialData({
        holder: "",
        issuedBy: "StarProof",
        issuedOn: new Date().toLocaleDateString(),
        expires: "",
        category: "",
        description: "",
      });
    } catch (error) {
      console.error("Credential creation error:", error);

      let errorMessage = "Please check your connection and try again.";
      let errorTitle = "Failed to create credential";

      if (error instanceof Error) {
        if (error.message.includes("Cannot connect to API server")) {
          errorTitle = "Backend Not Running";
          errorMessage =
            "The StarProof API backend is not running. Please start it with: cd StarProof-api && cargo run";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorTitle, {
        description: errorMessage,
        duration: 10000, // Show longer for backend connection issues
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Show API Key manager if user doesn't have an API key
  if (!isLoadingUser && userProfile && !userProfile.has_api_key) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Credential
          </h1>
          <p className="text-gray-600 mt-1">
            Design and issue new digital credentials
          </p>
        </div>

        {/* API Key Required Notice */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800">
                  API Key Required
                </h3>
                <p className="text-amber-700">
                  You need to generate an API key before you can create
                  credentials.
                </p>
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = "/api-key-management")}
              className="w-full mt-4"
            >
              <Key className="w-4 h-4 mr-2" />
              Go to API Key Management
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingUser) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Credential
          </h1>
          <p className="text-gray-600 mt-1">
            Design and issue new digital credentials
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Credential
          </h1>
          <p className="text-gray-600 mt-1">
            Design and issue new digital credentials
          </p>
        </div>

        {/* API Key Status */}
        {userProfile?.has_api_key && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            API Key Active
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Credential Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Credential Preview
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center space-x-2"
            >
              {isFlipped ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{isFlipped ? "Front" : "Back"}</span>
            </Button>
          </div>

          {/* Credit Card Style Credential */}
          <div className="relative w-full max-w-md">
            <div className={`credential-card ${isFlipped ? "flipped" : ""}`}>
              {/* Front of Card */}
              <div className="credential-front">
                <div className="relative w-full h-56 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-xl shadow-xl overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src="/white.png"
                          alt="StarProof"
                          className="w-8 h-8"
                        />
                        <span className="text-sm font-medium">StarProof</span>
                      </div>
                      <CreditCard className="w-6 h-6" />
                    </div>

                    {/* Middle Content */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-blue-200 uppercase tracking-wide">
                          Holder
                        </p>
                        <p className="text-lg font-semibold truncate">
                          {credentialData.holder || "John Doe"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-blue-200 uppercase tracking-wide">
                            Category
                          </p>
                          <p className="text-sm font-medium truncate">
                            {credentialData.category || "Identity"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-200 uppercase tracking-wide">
                            Expires
                          </p>
                          <p className="text-sm font-medium">
                            {credentialData.expires
                              ? new Date(
                                  credentialData.expires
                                ).toLocaleDateString()
                              : "12/25"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-200 uppercase tracking-wide">
                          Issued By
                        </p>
                        <p className="text-sm font-medium">
                          {credentialData.issuedBy}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Verified</span>
                        </div>
                        {createdContract && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Shield className="w-3 h-3" />
                            <span className="text-xs">Blockchain</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div className="credential-back">
                <div className="relative w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-xl overflow-hidden">
                  {/* Magnetic Stripe */}
                  <div className="w-full h-12 bg-black mt-6"></div>

                  <div className="p-6 text-white space-y-4">
                    <div>
                      <p className="text-xs text-gray-300 uppercase tracking-wide">
                        Issued On
                      </p>
                      <p className="text-sm font-medium">
                        {credentialData.issuedOn}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-300 uppercase tracking-wide">
                        Description
                      </p>
                      <p className="text-xs text-gray-200 leading-relaxed">
                        {credentialData.description ||
                          "Digital credential issued by StarProof platform for secure verification and authentication."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs">
                          {createdContract
                            ? "Stellar Verified"
                            : "Blockchain Verified"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-300">
                          {createdContract
                            ? `ID: ${createdContract.id.slice(-8)}`
                            : "ID: **** **** ****"}
                        </p>
                        {createdContract && (
                          <p className="text-xs text-gray-400 mt-1">
                            Contract:{" "}
                            {createdContract.contractAddress.slice(0, 4)}...
                            {createdContract.contractAddress.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Credential Details
          </h2>

          <Card className="p-6 space-y-6">
            {/* Credential Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Holder Name *
                  </label>
                  <input
                    type="text"
                    value={credentialData.holder}
                    onChange={e => handleInputChange("holder", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter holder name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issued By
                  </label>
                  <input
                    type="text"
                    value={credentialData.issuedBy}
                    onChange={e =>
                      handleInputChange("issuedBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={credentialData.category}
                    onChange={e =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Identity">Identity</option>
                    <option value="Education">Education</option>
                    <option value="Certification">Certification</option>
                    <option value="License">License</option>
                    <option value="Membership">Membership</option>
                    <option value="Achievement">Achievement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires On *
                  </label>
                  <input
                    type="date"
                    value={credentialData.expires}
                    onChange={e => handleInputChange("expires", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={credentialData.description}
                  onChange={e =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the credential"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setCredentialData({
                    holder: "",
                    issuedBy: "StarProof",
                    issuedOn: new Date().toLocaleDateString(),
                    expires: "",
                    category: "",
                    description: "",
                  });
                }}
              >
                Reset
              </Button>

              <Button
                onClick={handleCreateCredential}
                disabled={isCreating || !userProfile?.has_api_key}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Credential
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* My Credentials Section */}
      {userCredentials.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Credentials</h2>
            <div className="text-sm text-gray-500">
              {userCredentials.length} credential
              {userCredentials.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCredentials.map((credential, index) => {
              const isFlipped = flippedCards.has(credential.id);
              return (
                <div key={credential.id} className="group">
                  <div className="relative w-full max-w-md mx-auto cursor-pointer hover:scale-105 transition-transform">
                    <div
                      className={`mini-credential-card ${isFlipped ? "flipped" : ""}`}
                      onClick={() => openDetailModal(credential)}
                    >
                      {/* Front of Card */}
                      <div className="mini-credential-front">
                        <div className="relative w-full h-56 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-xl shadow-xl overflow-hidden">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                            <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
                          </div>

                          {/* Card Content */}
                          <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img
                                  src="/white.png"
                                  alt="StarProof"
                                  className="w-8 h-8"
                                />
                                <span className="text-sm font-medium">
                                  StarProof
                                </span>
                              </div>
                              <CreditCard className="w-6 h-6" />
                            </div>

                            {/* Middle Content */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-blue-200 uppercase tracking-wide">
                                  Holder
                                </p>
                                <p className="text-lg font-semibold truncate">
                                  {credential.holder || "Unknown Holder"}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-blue-200 uppercase tracking-wide">
                                    Category
                                  </p>
                                  <p className="text-sm font-medium truncate">
                                    {credential.category || "General"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-blue-200 uppercase tracking-wide">
                                    Expires
                                  </p>
                                  <p className="text-sm font-medium">
                                    {credential.expiresAt
                                      ? new Date(
                                          credential.expiresAt
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-blue-200 uppercase tracking-wide">
                                  Issued By
                                </p>
                                <p className="text-sm font-medium">
                                  {credentialData.issuedBy}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs">Verified</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="mini-credential-back">
                        <div className="relative w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-xl overflow-hidden">
                          {/* Magnetic Stripe */}
                          <div className="w-full h-12 bg-black mt-6"></div>

                          <div className="p-6 text-white space-y-4">
                            <div>
                              <p className="text-xs text-gray-300 uppercase tracking-wide">
                                Issued On
                              </p>
                              <p className="text-sm font-medium">
                                {credential.issuedAt
                                  ? new Date(
                                      credential.issuedAt
                                    ).toLocaleDateString()
                                  : new Date().toLocaleDateString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-300 uppercase tracking-wide">
                                Description
                              </p>
                              <p className="text-xs text-gray-200 leading-relaxed">
                                {credential.description ||
                                  "Digital credential issued by StarProof platform for secure verification and authentication."}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                              <div className="flex items-center space-x-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs">
                                  Stellar Verified
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-300">
                                  ID: {credential.id.slice(-8)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Contract:{" "}
                                  {credential.contractAddress.slice(0, 4)}...
                                  {credential.contractAddress.slice(-4)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && qrCodeUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Scan QR Code to Verify
              </h3>
              <div className="flex justify-center mb-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with any camera to verify the credential
                authenticity
              </p>
              <Button onClick={() => setShowQrModal(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Detail Modal */}
      {showDetailModal && selectedCredential && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left Column - Large Credential Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Credential Details
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailCardFlipped(!detailCardFlipped)}
                    className="flex items-center space-x-2"
                  >
                    {detailCardFlipped ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span>{detailCardFlipped ? "Front" : "Back"}</span>
                  </Button>
                </div>

                {/* Large Credit Card */}
                <div className="relative w-full max-w-md mx-auto">
                  <div
                    className={`credential-card ${detailCardFlipped ? "flipped" : ""}`}
                  >
                    {/* Front of Card */}
                    <div className="credential-front">
                      <div className="relative w-full h-56 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-xl shadow-xl overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                          <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
                        </div>

                        {/* Card Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img
                                src="/white.png"
                                alt="StarProof"
                                className="w-8 h-8"
                              />
                              <span className="text-sm font-medium">
                                StarProof
                              </span>
                            </div>
                            <CreditCard className="w-6 h-6" />
                          </div>

                          {/* Middle Content */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-blue-200 uppercase tracking-wide">
                                Holder
                              </p>
                              <p className="text-lg font-semibold truncate">
                                {selectedCredential.holder || "Unknown Holder"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-blue-200 uppercase tracking-wide">
                                  Category
                                </p>
                                <p className="text-sm font-medium truncate">
                                  {selectedCredential.category || "General"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-blue-200 uppercase tracking-wide">
                                  Expires
                                </p>
                                <p className="text-sm font-medium">
                                  {selectedCredential.expiresAt
                                    ? new Date(
                                        selectedCredential.expiresAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-blue-200 uppercase tracking-wide">
                                Issued By
                              </p>
                              <p className="text-sm font-medium">
                                {selectedCredential.issuer || "StarProof"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Verified</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                <Shield className="w-3 h-3" />
                                <span className="text-xs">Blockchain</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="credential-back">
                      <div className="relative w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-xl overflow-hidden">
                        {/* Magnetic Stripe */}
                        <div className="w-full h-12 bg-black mt-6"></div>

                        <div className="p-6 text-white space-y-4">
                          <div>
                            <p className="text-xs text-gray-300 uppercase tracking-wide">
                              Issued On
                            </p>
                            <p className="text-sm font-medium">
                              {selectedCredential.issuedAt
                                ? new Date(
                                    selectedCredential.issuedAt
                                  ).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-300 uppercase tracking-wide">
                              Description
                            </p>
                            <p className="text-xs text-gray-200 leading-relaxed">
                              {selectedCredential.description ||
                                "Digital credential issued by StarProof platform for secure verification and authentication."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-xs">Stellar Verified</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-300">
                                ID: {selectedCredential.id.slice(-8)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Contract:{" "}
                                {selectedCredential.contractAddress.slice(0, 4)}
                                ...
                                {selectedCredential.contractAddress.slice(-4)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Verification QR Code
                  </h3>
                  <div className="inline-block p-4 bg-white rounded-lg shadow-lg border">
                    <img
                      src={selectedCredential.qrCode}
                      alt="Verification QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Scan this QR code to verify the credential authenticity
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedCredential.verificationUrl
                      );
                      toast.success("Verification URL copied!");
                    }}
                    className="mt-2"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Verification URL
                  </Button>
                </div>
              </div>

              {/* Right Column - Stellar Information */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Blockchain Information
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Credential ID */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Credential ID
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCredential.id);
                          toast.success("Credential ID copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {selectedCredential.id}
                    </p>
                  </Card>

                  {/* Contract Address */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Contract Address
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedCredential.contractAddress
                          );
                          toast.success("Contract address copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {selectedCredential.contractAddress}
                    </p>
                  </Card>

                  {/* Transaction Hash */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Transaction Hash
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedCredential.transactionHash
                            );
                            toast.success("Transaction hash copied!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://stellar.expert/explorer/testnet/tx/${selectedCredential.transactionHash}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {selectedCredential.transactionHash}
                    </p>
                  </Card>

                  {/* Verification URL */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Verification URL
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedCredential.verificationUrl
                          );
                          toast.success("Verification URL copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                      {selectedCredential.verificationUrl}
                    </p>
                  </Card>

                  {/* Status */}
                  <Card className="p-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        Active & Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      This credential is deployed on Stellar blockchain and
                      ready for verification
                    </p>
                  </Card>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() =>
                        window.open(
                          selectedCredential.verificationUrl,
                          "_blank"
                        )
                      }
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Verification Page
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://stellar.expert/explorer/testnet/tx/${selectedCredential.transactionHash}`,
                          "_blank"
                        )
                      }
                      className="w-full"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      View on Stellar Explorer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .credential-card {
          perspective: 1000px;
          width: 100%;
          height: 224px;
        }

        .credential-front,
        .credential-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s;
        }

        .credential-back {
          transform: rotateY(180deg);
        }

        .credential-card.flipped .credential-front {
          transform: rotateY(180deg);
        }

        .credential-card.flipped .credential-back {
          transform: rotateY(0deg);
        }

        /* Mini credential card styles */
        .mini-credential-card {
          perspective: 1000px;
          width: 100%;
          height: 224px;
        }

        .mini-credential-front,
        .mini-credential-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s;
        }

        .mini-credential-back {
          transform: rotateY(180deg);
        }

        .mini-credential-card.flipped .mini-credential-front {
          transform: rotateY(180deg);
        }

        .mini-credential-card.flipped .mini-credential-back {
          transform: rotateY(0deg);
        }
      `}</style>
    </div>
  );
}
