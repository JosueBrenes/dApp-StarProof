import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

interface GenerateKeyRequest {
  publicKey: string;
  signature: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateKeyRequest = await request.json();
    const { publicKey, signature, message } = body;

    // Validate required fields
    if (!publicKey || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: publicKey, signature, message' },
        { status: 400 }
      );
    }

    // For now, we'll skip signature verification in development
    // In production, you should verify the Stellar signature
    console.log('API Key generation request:', {
      publicKey,
      message,
      signature: signature.substring(0, 20) + '...',
    });

    // Generate a unique API key
    const keyPrefix = 'spk_test_'; // Use spk_test_ prefix as required
    const keyData = randomBytes(32).toString('hex');
    const apiKey = keyPrefix + keyData;

    // Hash the API key for storage (same as StarProof API does)
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    console.log('Generated API key:', {
      apiKey: apiKey.substring(0, 20) + '...',
      keyHash: keyHash.substring(0, 20) + '...',
      publicKey,
    });

    // TODO: Store the API key in the database
    // For now, we'll just return the key
    // In a real implementation, you would:
    // 1. Verify the Stellar signature
    // 2. Store the key_hash and issuer_id (public key) in the database
    // 3. Mark it as active

    return NextResponse.json({
      success: true,
      apiKey,
      message: 'API key generated successfully',
    });

  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}