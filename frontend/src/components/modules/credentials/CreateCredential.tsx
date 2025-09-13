"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Sparkles,
  User,
  Building,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialContract | null>(null);
  const [detailCardFlipped, setDetailCardFlipped] = useState(false);

  // Customization states
  const [selectedGradient, setSelectedGradient] =
    useState<string>("blue-purple");
  const [selectedLogo, setSelectedLogo] = useState<string>("starproof");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [customGradient, setCustomGradient] = useState<{
    start: string;
    end: string;
  }>({ start: "#3b82f6", end: "#7c3aed" });
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>("");
  const [customLogoText, setCustomLogoText] = useState<string>("");

  // Load customization settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("credentialCustomization");
      console.log("Loading saved settings:", saved);
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          console.log("Parsed settings:", settings);
          setSelectedGradient(settings.selectedGradient || "blue-purple");
          setSelectedLogo(settings.selectedLogo || "starproof");
          setSelectedTemplate(settings.selectedTemplate || "classic");
          setCustomGradient(
            settings.customGradient || { start: "#3b82f6", end: "#7c3aed" }
          );
          setCustomLogoUrl(settings.customLogoUrl || "");
          setCustomLogoText(settings.customLogoText || "");
          console.log(
            "Settings loaded, customLogoText set to:",
            settings.customLogoText
          );
        } catch (error) {
          console.warn("Error loading customization settings:", error);
        }
      } else {
        console.log("No saved settings found");
      }
    };
    loadSettings();
  }, []);

  // Save settings whenever they change (debounced)
  useEffect(() => {
    const saveSettings = () => {
      const settings = {
        selectedGradient,
        selectedLogo,
        selectedTemplate,
        customGradient,
        customLogoUrl,
        customLogoText,
      };
      console.log("Saving settings:", settings);
      try {
        localStorage.setItem(
          "credentialCustomization",
          JSON.stringify(settings)
        );
        console.log("Settings saved successfully");
      } catch (error) {
        console.warn("Error saving customization settings:", error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveSettings, 300);
    return () => clearTimeout(timeoutId);
  }, [
    selectedGradient,
    selectedLogo,
    selectedTemplate,
    customGradient,
    customLogoUrl,
    customLogoText,
  ]);

  // Check if user has API key when user profile loads
  useEffect(() => {
    if (userProfile && !userProfile.has_api_key) {
      toast.error("API Key Required", {
        description:
          "You need to generate an API key before creating credentials.",
      });
    }
  }, [userProfile]);

  // API health check disabled to prevent console errors
  // The app works fine in offline mode without health checks

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

  const openDetailModal = (credential: CredentialContract) => {
    setSelectedCredential(credential);
    setDetailCardFlipped(false);
    setShowDetailModal(true);
  };

  // Get gradient classes or style based on selection
  const getGradientClasses = (gradient: string): string => {
    switch (gradient) {
      case "emerald-teal":
        return "from-emerald-600 via-teal-600 to-cyan-800";
      case "rose-red":
        return "from-rose-600 via-pink-600 to-red-800";
      case "amber-orange":
        return "from-amber-600 via-orange-600 to-red-800";
      case "gray-slate":
        return "from-gray-600 via-slate-600 to-gray-800";
      case "blue-purple":
      default:
        return "from-blue-600 via-purple-600 to-indigo-800";
    }
  };

  // Get gradient style for custom colors
  const getGradientStyle = (gradient: string) => {
    if (gradient === "custom") {
      return {
        background: `linear-gradient(135deg, ${customGradient.start} 0%, ${customGradient.end} 100%)`,
      };
    }
    return {};
  };

  // Get logo component based on selection
  const getLogoComponent = (logo: string) => {
    switch (logo) {
      case "shield":
        return <Shield className="w-8 h-8" />;
      case "custom-image":
        return customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="Custom Logo"
            className="w-8 h-8 object-contain"
          />
        ) : (
          <img src="/white.png" alt="StarProof" className="w-8 h-8" />
        );
      case "custom-text":
        return (
          <span className="text-lg font-bold">{customLogoText || "LOGO"}</span>
        );
      case "starproof":
      default:
        return <img src="/white.png" alt="StarProof" className="w-8 h-8" />;
    }
  };

  // Get logo text based on selection
  const getLogoText = (logo: string) => {
    console.log(
      "getLogoText called with logo:",
      logo,
      "customLogoText:",
      customLogoText
    );
    // Always show custom text if it exists and is not empty, regardless of logo type
    if (customLogoText && customLogoText.trim() !== "") {
      return customLogoText;
    }

    // Fallback to default text based on logo type
    switch (logo) {
      case "custom-text":
        return "LOGO";
      case "shield":
        return "StarProof";
      case "custom-image":
        return "StarProof";
      case "starproof":
      default:
        return "StarProof";
    }
  };

  // Handle custom logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setCustomLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions for credential list styling
  const getCredentialGradientClasses = (customization: {
    selectedGradient?: string;
    customGradient?: { start: string; end: string };
    selectedLogo?: string;
    customLogoUrl?: string;
    customLogoText?: string;
    selectedTemplate?: string;
  } | null | undefined): string => {
    const gradient = customization?.selectedGradient || "blue-purple";
    switch (gradient) {
      case "emerald-teal":
        return "from-emerald-600 via-teal-600 to-cyan-800";
      case "rose-red":
        return "from-rose-600 via-pink-600 to-red-800";
      case "amber-orange":
        return "from-amber-600 via-orange-600 to-red-800";
      case "gray-slate":
        return "from-gray-600 via-slate-600 to-gray-800";
      case "blue-purple":
      default:
        return "from-blue-600 via-purple-600 to-indigo-800";
    }
  };

  const getCredentialGradientStyle = (customization: {
    selectedGradient?: string;
    customGradient?: { start: string; end: string };
  } | null | undefined) => {
    if (
      customization?.selectedGradient === "custom" &&
      customization?.customGradient
    ) {
      return {
        background: `linear-gradient(135deg, ${customization.customGradient.start} 0%, ${customization.customGradient.end} 100%)`,
      };
    }
    return {};
  };

  const getCredentialLogoComponent = (customization: {
    selectedLogo?: string;
    customLogoUrl?: string;
    customLogoText?: string;
  } | null | undefined) => {
    const logo = customization?.selectedLogo || "starproof";
    switch (logo) {
      case "shield":
        return <Shield className="w-8 h-8" />;
      case "custom-image":
        return customization?.customLogoUrl ? (
          <img
            src={customization.customLogoUrl}
            alt="Custom Logo"
            className="w-8 h-8 object-contain"
          />
        ) : (
          <img src="/white.png" alt="StarProof" className="w-8 h-8" />
        );
      case "custom-text":
        return (
          <span className="text-lg font-bold">
            {customization?.customLogoText || "LOGO"}
          </span>
        );
      case "starproof":
      default:
        return <img src="/white.png" alt="StarProof" className="w-8 h-8" />;
    }
  };

  const getCredentialLogoText = (customization: {
    selectedLogo?: string;
    customLogoText?: string;
  } | null | undefined) => {
    // Always show custom text if it exists and is not empty, regardless of logo type
    if (
      customization?.customLogoText &&
      customization.customLogoText.trim() !== ""
    ) {
      return customization.customLogoText;
    }

    // Fallback to default text based on logo type
    const logo = customization?.selectedLogo || "starproof";
    switch (logo) {
      case "custom-text":
        return "LOGO";
      case "shield":
        return "StarProof";
      case "custom-image":
        return "StarProof";
      case "starproof":
      default:
        return "StarProof";
    }
  };

  const getCredentialTemplate = (customization: {
    selectedTemplate?: string;
  } | null | undefined) => {
    const template = customization?.selectedTemplate || "classic";
    switch (template) {
      case "modern":
        return (
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white transform rotate-45 translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white transform rotate-12 -translate-x-8 translate-y-8"></div>
            <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white rounded-full"></div>
          </>
        );
      case "corporate":
        return (
          <>
            <div className="absolute top-4 right-4 w-20 h-1 bg-white"></div>
            <div className="absolute top-8 right-4 w-16 h-1 bg-white"></div>
            <div className="absolute top-12 right-4 w-12 h-1 bg-white"></div>
            <div className="absolute bottom-4 left-4 w-1 h-20 bg-white"></div>
            <div className="absolute bottom-4 left-8 w-1 h-16 bg-white"></div>
            <div className="absolute bottom-4 left-12 w-1 h-12 bg-white"></div>
          </>
        );
      case "classic":
      default:
        return (
          <>
            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
          </>
        );
    }
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
          customization: {
            selectedGradient,
            selectedLogo,
            selectedTemplate,
            customGradient,
            customLogoUrl,
            customLogoText,
          },
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
          <h1 className="text-3xl font-bold text-foreground">
            Create Credential
          </h1>
          <p className="text-muted-foreground mt-1">
            Design and issue new digital credentials
          </p>
        </div>

        {/* API Key Required Notice */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-orange-400/10 backdrop-blur-sm border border-orange-400/20 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-lg font-semibold text-orange-400">
                  API Key Required
                </h3>
                <p className="text-orange-400/80">
                  You need to generate an API key before you can create
                  credentials.
                </p>
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = "/api-key-management")}
              className="w-full mt-4 bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all"
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
          <h1 className="text-3xl font-bold text-foreground">
            Create Credential
          </h1>
          <p className="text-muted-foreground mt-1">
            Design and issue new digital credentials
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Create Credential
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Credential Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
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
                <div
                  className={`relative w-full h-56 ${selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getGradientClasses(selectedGradient)} rounded-xl shadow-xl overflow-hidden`}
                  style={getGradientStyle(selectedGradient)}
                >
                  {/* Background Pattern - Changes based on template */}
                  <div className="absolute inset-0 opacity-10">
                    {selectedTemplate === "classic" && (
                      <>
                        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
                      </>
                    )}
                    {selectedTemplate === "modern" && (
                      <>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white transform rotate-45 translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white transform rotate-12 -translate-x-8 translate-y-8"></div>
                        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-white rounded-full"></div>
                        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white rounded-full"></div>
                      </>
                    )}
                    {selectedTemplate === "corporate" && (
                      <>
                        <div className="absolute top-4 right-4 w-20 h-1 bg-white"></div>
                        <div className="absolute top-8 right-4 w-16 h-1 bg-white"></div>
                        <div className="absolute top-12 right-4 w-12 h-1 bg-white"></div>
                        <div className="absolute bottom-4 left-4 w-1 h-20 bg-white"></div>
                        <div className="absolute bottom-4 left-8 w-1 h-16 bg-white"></div>
                        <div className="absolute bottom-4 left-12 w-1 h-12 bg-white"></div>
                      </>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getLogoComponent(selectedLogo)}
                        <span className="text-sm font-medium">
                          {getLogoText(selectedLogo)}
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

          {/* Customization Options */}
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-[#1B6BFF]" />
              Personalizar Credencial
            </h3>

            <div className="space-y-6">
              {/* Color Selection */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Color de Fondo
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedGradient("blue-purple")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 border-2 ${selectedGradient === "blue-purple" ? "border-blue-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Azul Púrpura"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("emerald-teal")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-800 border-2 ${selectedGradient === "emerald-teal" ? "border-teal-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Verde Esmeralda"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("rose-red")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-rose-600 via-pink-600 to-red-800 border-2 ${selectedGradient === "rose-red" ? "border-rose-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Rosa Rojo"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("amber-orange")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 via-orange-600 to-red-800 border-2 ${selectedGradient === "amber-orange" ? "border-amber-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Ámbar Naranja"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("gray-slate")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 via-slate-600 to-gray-800 border-2 ${selectedGradient === "gray-slate" ? "border-gray-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Gris Elegante"
                  ></button>

                  {/* Custom Color Picker Button */}
                  <button
                    onClick={() => {
                      setSelectedGradient("custom");
                      setShowColorPicker(!showColorPicker);
                    }}
                    className={`w-12 h-12 rounded-lg border-2 ${selectedGradient === "custom" ? "border-purple-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform flex items-center justify-center bg-white`}
                    style={
                      selectedGradient === "custom"
                        ? {
                            background: `linear-gradient(135deg, ${customGradient.start} 0%, ${customGradient.end} 100%)`,
                          }
                        : {}
                    }
                    title="Paleta Personalizada"
                  >
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Color Picker Panel */}
                {showColorPicker && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white/5 backdrop-blur-sm">
                    <h5 className="text-sm font-medium text-muted-foreground mb-3">
                      Colores Personalizados
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                          Color Inicial
                        </label>
                        <input
                          type="color"
                          value={customGradient.start}
                          onChange={e =>
                            setCustomGradient(prev => ({
                              ...prev,
                              start: e.target.value,
                            }))
                          }
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                          Color Final
                        </label>
                        <input
                          type="color"
                          value={customGradient.end}
                          onChange={e =>
                            setCustomGradient(prev => ({
                              ...prev,
                              end: e.target.value,
                            }))
                          }
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Logo Selection */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Estilo de Logo
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedLogo("starproof")}
                      className={`p-3 ${selectedLogo === "starproof" ? "bg-blue-50 border-blue-200" : "bg-white/5 backdrop-blur-sm border-gray-300"} border-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center`}
                    >
                      <img
                        src="/white.png"
                        alt="StarProof"
                        className="w-6 h-6 mr-2"
                      />
                      <span className="text-sm font-medium">StarProof</span>
                    </button>
                    <button
                      onClick={() => setSelectedLogo("shield")}
                      className={`p-3 ${selectedLogo === "shield" ? "bg-blue-50 border-blue-200" : "bg-white/5 backdrop-blur-sm border-gray-300"} border-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center`}
                    >
                      <Shield className="w-6 h-6 mr-2 text-[#1B6BFF]" />
                      <span className="text-sm font-medium">Escudo</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedLogo("custom-text")}
                      className={`p-3 ${selectedLogo === "custom-text" ? "bg-green-50 border-green-200" : "bg-white/5 backdrop-blur-sm border-gray-300"} border-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center`}
                    >
                      <span className="text-lg font-bold mr-2">ABC</span>
                      <span className="text-sm font-medium">Texto</span>
                    </button>
                    <button
                      onClick={() => setSelectedLogo("custom-image")}
                      className={`p-3 ${selectedLogo === "custom-image" ? "bg-purple-50 border-purple-200" : "bg-white/5 backdrop-blur-sm border-gray-300"} border-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center`}
                    >
                      <svg
                        className="w-6 h-6 mr-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Imagen</span>
                    </button>
                  </div>

                  {/* Custom Text Input */}
                  {selectedLogo === "custom-text" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customLogoText}
                        onChange={e => {
                          console.log(
                            "Changing custom text to:",
                            e.target.value
                          );
                          setCustomLogoText(e.target.value);
                        }}
                        placeholder="Ingresa tu texto..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500">
                        El texto aparecerá como logo en tu credencial
                      </p>
                    </div>
                  )}

                  {/* Custom Image Upload */}
                  {selectedLogo === "custom-image" && (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        {customLogoUrl ? (
                          <div className="space-y-2">
                            <img
                              src={customLogoUrl}
                              alt="Logo preview"
                              className="w-16 h-16 object-contain mx-auto"
                            />
                            <p className="text-sm text-green-400">
                              Logo cargado correctamente
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-sm text-muted-foreground">
                              Sube tu logo
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-block mt-2 px-3 py-1 bg-blue-50 text-[#1B6BFF] text-sm rounded hover:bg-blue-100 transition-colors"
                        >
                          {customLogoUrl
                            ? "Cambiar imagen"
                            : "Seleccionar archivo"}
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, SVG hasta 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Plantilla
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedTemplate("classic")}
                    className={`p-3 ${selectedTemplate === "classic" ? "bg-blue-50 border-blue-200" : "bg-white/5 backdrop-blur-sm border-gray-300"} border-2 rounded-lg hover:bg-blue-100 transition-colors text-center`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-1 text-[#1B6BFF]" />
                    <span className="text-xs font-medium">Clásica</span>
                  </button>
                  <button
                    onClick={() => setSelectedTemplate("modern")}
                    className={`p-3 ${selectedTemplate === "modern" ? "bg-purple-50 border-purple-200" : "bg-white/5 backdrop-blur-sm border-gray-300"} border-2 rounded-lg hover:bg-gray-100 transition-colors text-center`}
                  >
                    <Sparkles className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <span className="text-xs font-medium">Moderna</span>
                  </button>
                  <button
                    onClick={() => setSelectedTemplate("corporate")}
                    className={`p-3 ${selectedTemplate === "corporate" ? "bg-indigo-50 border-indigo-200" : "bg-white/5 backdrop-blur-sm border-gray-300"} border-2 rounded-lg hover:bg-gray-100 transition-colors text-center`}
                  >
                    <Building className="w-6 h-6 mx-auto mb-1 text-indigo-600" />
                    <span className="text-xs font-medium">Corporativa</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Credential Details
          </h2>

          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6">
            {/* Credential Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <User className="w-5 h-5 mr-2 text-[#1B6BFF]" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                className="bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all"
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
            <h2 className="text-2xl font-bold text-foreground">My Credentials</h2>
            <div className="text-sm text-gray-500">
              {userCredentials.length} credential
              {userCredentials.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCredentials.map((credential) => {
              const isFlipped = false;
              return (
                <div key={credential.id} className="group">
                  <div className="relative w-full max-w-md mx-auto cursor-pointer hover:scale-105 transition-transform">
                    <div
                      className={`mini-credential-card ${isFlipped ? "flipped" : ""}`}
                      onClick={() => openDetailModal(credential)}
                    >
                      {/* Front of Card */}
                      <div className="mini-credential-front">
                        <div
                          className={`relative w-full h-56 ${credential.customization?.selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getCredentialGradientClasses(credential.customization)} rounded-xl shadow-xl overflow-hidden`}
                          style={getCredentialGradientStyle(
                            credential.customization
                          )}
                        >
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            {getCredentialTemplate(credential.customization)}
                          </div>

                          {/* Card Content */}
                          <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getCredentialLogoComponent(
                                  credential.customization
                                )}
                                <span className="text-sm font-medium">
                                  {getCredentialLogoText(
                                    credential.customization
                                  )}
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
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Scan QR Code to Verify
              </h3>
              <div className="flex justify-center mb-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
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
                  <h2 className="text-xl font-semibold text-foreground">
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
                      <div
                        className={`relative w-full h-56 ${selectedCredential.customization?.selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getCredentialGradientClasses(selectedCredential.customization)} rounded-xl shadow-xl overflow-hidden`}
                        style={getCredentialGradientStyle(
                          selectedCredential.customization
                        )}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          {getCredentialTemplate(
                            selectedCredential.customization
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getCredentialLogoComponent(
                                selectedCredential.customization
                              )}
                              <span className="text-sm font-medium">
                                {getCredentialLogoText(
                                  selectedCredential.customization
                                )}
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
                              <div className="flex items-center space-x-1 mt-1"></div>
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Verification QR Code
                  </h3>
                  <div className="inline-block p-4 bg-white rounded-lg shadow-lg border">
                    <img
                      src={selectedCredential.qrCode}
                      alt="Verification QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
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
                  <h2 className="text-xl font-semibold text-foreground">
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
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
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
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded">
                      {selectedCredential.id}
                    </p>
                  </Card>

                  {/* Contract Address */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
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
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded">
                      {selectedCredential.contractAddress}
                    </p>
                  </Card>

                  {/* Transaction Hash */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
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
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded">
                      {selectedCredential.transactionHash}
                    </p>
                  </Card>

                  {/* Verification URL */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
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
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded break-all">
                      {selectedCredential.verificationUrl}
                    </p>
                  </Card>

                  {/* Status */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        Active & Verified
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
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
