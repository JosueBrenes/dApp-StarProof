export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface WalletError {
  message: string;
  type: 'CONNECTION' | 'SIGNING' | 'NETWORK' | 'UNKNOWN';
}