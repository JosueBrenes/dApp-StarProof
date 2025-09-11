"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Key, RefreshCw, Eye, EyeOff, Trash2, RotateCcw } from 'lucide-react';
import { useWalletContext } from '@/providers/wallet.provider';
import { toast } from 'sonner';

export const ApiKeyManager: React.FC = () => {
  const { userProfile, isLoadingUser, generateApiKey, regenerateApiKey, deleteApiKey, refreshUserProfile } = useWalletContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerateApiKey = async () => {
    try {
      setIsGenerating(true);
      const newApiKey = await generateApiKey();
      setGeneratedKey(newApiKey);
      setShowApiKey(true);
      toast.success('API Key generada exitosamente!');
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Error al generar la API Key');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyApiKey = () => {
    const keyToCopy = generatedKey || userProfile?.api_key;
    if (keyToCopy) {
      navigator.clipboard.writeText(keyToCopy);
      toast.success('API Key copiada al portapapeles');
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      setIsRegenerating(true);
      const newApiKey = await regenerateApiKey();
      setGeneratedKey(newApiKey);
      setShowApiKey(true);
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
      setShowApiKey(false);
      toast.success('API Key eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Error al eliminar la API Key');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshUserProfile();
      toast.success('Estado actualizado');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  if (isLoadingUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Cargando información del usuario...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasApiKey = userProfile?.has_api_key || !!generatedKey;
  const apiKeyToShow = generatedKey || userProfile?.api_key;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Key Management
            </CardTitle>
            <CardDescription>
              Gestiona tu API key para crear credenciales
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant={hasApiKey ? "default" : "secondary"}>
            {hasApiKey ? "API Key Activa" : "Sin API Key"}
          </Badge>
        </div>

        {hasApiKey && apiKeyToShow && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tu API Key:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                className="flex items-center gap-1"
              >
                {showApiKey ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Mostrar
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                {showApiKey 
                  ? apiKeyToShow 
                  : apiKeyToShow.replace(/./g, '•').substring(0, 24) + '...'
                }
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyApiKey}
                className="flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
            </div>

            {generatedKey && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>¡Importante!</strong> Guarda esta API key de forma segura. 
                  No podrás verla nuevamente después de cerrar esta ventana.
                </p>
              </div>
            )}
          </div>
        )}

        {!hasApiKey && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Necesitas una API key para crear credenciales. Genera una ahora.
            </p>
            <Button
              onClick={handleGenerateApiKey}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Generar API Key
                </>
              )}
            </Button>
          </div>
        )}

        {hasApiKey && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateApiKey}
                disabled={isRegenerating}
                className="flex-1 flex items-center gap-2"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Regenerar
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteApiKey}
                disabled={isDeleting}
                className="flex-1 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Wallet: {userProfile?.wallet_address?.substring(0, 8)}...{userProfile?.wallet_address?.substring(-8)}
              </p>
              {userProfile?.created_at && (
                <p>
                  Registrado: {new Date(userProfile.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};