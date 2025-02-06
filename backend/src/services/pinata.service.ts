import axios from 'axios';
import { config } from '../config/env';
import { TokenMetadata } from '../types';

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

export async function uploadToIPFS(metadata: TokenMetadata): Promise<string> {
  try {
    const response = await axios.post(
      PINATA_API_URL,
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': config.PINATA_API_KEY!,
          'pinata_secret_api_key': config.PINATA_SECRET_KEY!
        }
      }
    );

    if (response.data.IpfsHash) {
      return `ipfs://${response.data.IpfsHash}`;
    }
    
    throw new Error('Failed to get IPFS hash from Pinata');
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
} 