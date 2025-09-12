export interface CredentialContract {
  id: string;
  holder: string;
  issuer: string;
  category: string;
  description: string;
  issuedAt: string;
  expiresAt: string;
  claims: Record<string, string | number | boolean>;
  schema?: string;
  contractAddress: string;
  transactionHash: string;
  verificationUrl: string;
  qrCode?: string; // QR code data URL for local display
  customization?: {
    selectedGradient?: string;
    customGradient?: { start: string; end: string };
    selectedLogo?: string;
    customLogoUrl?: string;
    customLogoText?: string;
    selectedTemplate?: string;
  };
}

export interface CreateCredentialRequest {
  templateId?: string; // UUID del template, usaremos uno fijo para MVP
  data?: Record<string, string | number | boolean>; // Datos específicos de la credencial
  holder: string;
  category: string;
  description: string;
  expiresAt: string;
  claims?: Record<string, string | number | boolean>;
  schema?: string;
  issuerWallet?: string; // Add wallet address of the issuer
}

export interface CreateCredentialResponse {
  success: boolean;
  credential: CredentialContract;
  message: string;
}

export interface VerifyCredentialResponse {
  success: boolean;
  credential: CredentialContract | null;
  message: string;
}

export class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = this.getApiUrl();
    console.log('API Service initialized with baseURL:', this.baseURL);
  }

  /**
   * Format issuer wallet address to display a friendly name
   */
  private formatIssuerName(issuerWallet?: string): string {
    if (!issuerWallet) {
      return "StarProof";
    }
    
    // If it's a Stellar wallet address (starts with G and is 56 characters)
    if (issuerWallet.startsWith('G') && issuerWallet.length === 56) {
      // Return a shortened version with "StarProof" as the main name
      const shortAddress = `${issuerWallet.slice(0, 4)}...${issuerWallet.slice(-4)}`;
      return `StarProof (${shortAddress})`;
    }
    
    // If it's not a Stellar address, return as is or default
    return issuerWallet || "StarProof";
  }

  private getApiUrl(): string {
    // Use environment variable if set
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    
    // For development, try to detect current environment
    if (typeof window !== 'undefined') {
      const currentPort = window.location.port;
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      
      // If running on localhost, use common API port patterns
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Try port 8080 first (default for StarProof API)
        return `${protocol}//${hostname}:8080/v1`;
      }
    }
    
    // Final fallback
    return 'http://localhost:8080/v1';
  }

  /**
   * Create a new credential via API (which will deploy to Stellar)
   */
  async createCredential(
    credentialData: CreateCredentialRequest,
    apiKey: string
  ): Promise<CreateCredentialResponse> {
    console.log('Creating credential with data:', credentialData);
    console.log('Using API URL:', `${this.baseURL}/credentials`);
    
    // Prepare data according to API schema
    const apiPayload = {
      templateId: "550e8400-e29b-41d4-a716-446655440000", // Fixed template ID for MVP
      data: {
        // Essential credential data
        holder: credentialData.holder,
        category: credentialData.category,
        description: credentialData.description,
        expiresAt: credentialData.expiresAt,
        issuerWallet: credentialData.issuerWallet,
      },
      // Optional fields for API
      holder: credentialData.holder,
      category: credentialData.category,
      description: credentialData.description,
      expiresAt: credentialData.expiresAt,
      claims: credentialData.claims || {},
      schema: credentialData.schema || "https://schema.org/Certificate",
      issuerWallet: credentialData.issuerWallet,
    };

    console.log('API Payload prepared:', apiPayload);
    
    try {
      const response = await fetch(`${this.baseURL}/credentials`, {
        method: 'POST',
        headers: {
          'X-SP-Key': apiKey, // API expects X-SP-Key header, not Authorization
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Success response:', data);
      
      // Log raw API response to understand data structure
      console.log("🔍 Raw API response:", JSON.stringify(data, null, 2));
      
      // Transform API response to match our interface
      const credentialId = data.credentialId || data.credential_id || "unknown";
      const onchainTxId = data.onchainTxId || data.onchain_tx_id;
      const verifyUrl = data.verifyUrl || data.verify_url;
      
      // Check if we have real Stellar transaction hash (64 hex characters)
      const isRealStellarTx = onchainTxId && 
        onchainTxId !== "N/A" && 
        onchainTxId.length === 64 && 
        /^[a-f0-9]+$/i.test(onchainTxId);
      
      console.log("🔍 Stellar data check:", {
        onchainTxId,
        isRealStellarTx,
        txLength: onchainTxId?.length,
        hasVerifyUrl: !!verifyUrl
      });
      
      // For real Stellar deployments, use the transaction hash as both contract and transaction ID
      // In Stellar, the "contract address" concept translates to the account that created the transaction
      const transformedResponse: CreateCredentialResponse = {
        success: true,
        credential: {
          id: credentialId,
          holder: credentialData.holder,
          issuer: this.formatIssuerName(credentialData.issuerWallet),
          category: credentialData.category,
          description: credentialData.description,
          issuedAt: new Date().toISOString(),
          expiresAt: credentialData.expiresAt,
          claims: credentialData.claims || {},
          schema: credentialData.schema,
          contractAddress: isRealStellarTx ? onchainTxId : `mock_contract_${credentialId.slice(-8)}`,
          transactionHash: isRealStellarTx ? onchainTxId : `mock_tx_${credentialId.slice(-8)}`,
          verificationUrl: verifyUrl || `https://verify.starproof.io/credentials/${credentialId}`,
        },
        message: isRealStellarTx ? "Credential deployed to Stellar testnet blockchain! 🎉" : "Credential created (mock deployment)"
      };
      
      return transformedResponse;
    } catch (error) {
      console.error('Error creating credential:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to API server at ${this.baseURL}. Please ensure the backend is running.`);
      }
      
      throw error;
    }
  }

  /**
   * Verify a credential by ID and issuer
   */
  async verifyCredential(
    credentialId: string,
    issuerAddress: string
  ): Promise<VerifyCredentialResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/credentials/verify?id=${credentialId}&issuer=${issuerAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying credential:', error);
      throw error;
    }
  }

  /**
   * Get all credentials for a user (optional feature)
   */
  async getUserCredentials(apiKey: string): Promise<CredentialContract[]> {
    try {
      const response = await fetch(`${this.baseURL}/credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.credentials || [];
    } catch (error) {
      console.error('Error fetching user credentials:', error);
      return [];
    }
  }

  /**
   * Get API health status
   */
  async getHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      return { status: 'error', message: 'API unreachable' };
    }
  }
}

export const apiService = new APIService();