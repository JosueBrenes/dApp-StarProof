"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Clock,
  User,
  Building,
  Tag,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { apiService, CredentialContract } from '@/services/api.service';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [credential, setCredential] = useState<CredentialContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const credentialId = searchParams.get('id');
    const issuerAddress = searchParams.get('issuer');

    if (!credentialId || !issuerAddress) {
      setError('Invalid verification link. Missing credential ID or issuer address.');
      setIsLoading(false);
      return;
    }

    verifyCredential(credentialId, issuerAddress);
  }, [searchParams]);

  const verifyCredential = async (credentialId: string, issuerAddress: string) => {
    try {
      setIsLoading(true);
      const result = await apiService.verifyCredential(credentialId, issuerAddress);
      
      if (result.success && result.credential) {
        setCredential(result.credential);
      } else {
        setError(result.message || 'Credential not found or invalid on the Stellar network.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify credential. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Credential</h2>
          <p className="text-gray-600">
            Checking credential authenticity on the Stellar blockchain...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700"
          >
            Go to StarProof
          </Button>
        </Card>
      </div>
    );
  }

  if (!credential) {
    return null;
  }

  const expired = isExpired(credential.expiresAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Credential Verification</h1>
          <p className="text-gray-600">Verified on Stellar Blockchain</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Verification Status</h2>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                expired ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {expired ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Expired</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Valid</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Blockchain Verified</p>
                  <p className="text-sm text-gray-600">Credential exists on Stellar network</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Authentic Issuer</p>
                  <p className="text-sm text-gray-600">Issued by verified StarProof account</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                {expired ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {expired ? 'Credential Expired' : 'Valid Period'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {expired 
                      ? `Expired on ${new Date(credential.expiresAt).toLocaleDateString()}`
                      : `Valid until ${new Date(credential.expiresAt).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={() => window.open(
                  `https://stellar.expert/explorer/testnet/account/${credential.contractAddress}`,
                  '_blank'
                )}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Stellar Explorer
              </Button>
            </div>
          </Card>

          {/* Credential Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credential Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Holder</label>
                  </div>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{credential.holder}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Issued By</label>
                  </div>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{credential.issuer}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Category</label>
                  </div>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{credential.category}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Issued On</label>
                  </div>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {new Date(credential.issuedAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Expires On</label>
                  </div>
                  <p className={`p-3 rounded-lg ${
                    expired ? 'text-red-900 bg-red-50' : 'text-gray-900 bg-gray-50'
                  }`}>
                    {new Date(credential.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {credential.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{credential.description}</p>
                </div>
              )}

              {credential.claims && Object.keys(credential.claims).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Claims</label>
                  <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(credential.claims, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Technical Information */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Technical Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Credential ID</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg font-mono break-all">
                {credential.id}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Contract Address</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg font-mono break-all">
                {credential.contractAddress}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Network</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                Stellar Testnet
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            This credential was verified using StarProof&apos;s blockchain verification system
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Create Your Own Credentials
          </Button>
        </div>
      </div>
    </div>
  );
}