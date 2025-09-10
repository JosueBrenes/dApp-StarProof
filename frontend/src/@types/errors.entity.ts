export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface WalletError {
  message: string;
  type: 'CONNECTION' | 'SIGNING' | 'NETWORK' | 'UNKNOWN';
}