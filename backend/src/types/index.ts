export interface TokenMetadata {
  name: string;
  symbol: string;
  totalSupply: number;
  description: string;
  image?: string;
  attributes?: Record<string, any>;
}

export interface MemeCoinResponse {
  memecoin_name: string;
  memecoin_contract: string;
  wallet_address: string;
  ipfs_uri: string;
  status: string;
  metadata: TokenMetadata;
} 