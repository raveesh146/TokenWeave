export interface ProductData {
    name: string;
    description: string;
    price: bigint;
    category: number;
    ipfsUri: string;
    companyAddress: string;
}

export interface TokenMetadata {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

export interface MemeCoinResponse {
  memecoin_name: string;
  memecoin_contract: string;
  wallet_address: string;
  ipfs_uri: string;
  status: string;
  metadata: TokenMetadata;
} 