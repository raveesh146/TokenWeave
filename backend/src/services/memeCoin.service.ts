import { HumanMessage } from "@langchain/core/messages";
import { initializeAgent } from '../config/agentkit';
import { uploadToIPFS } from './pinata.service';
import { getTwitterData, TwitterData } from './twitter.service';
import { TokenMetadata, MemeCoinResponse } from '../types';

interface MemeCoinInput {
  company_name: string;
  product_name: string;
  twitter_handle: string;
  product_info: string;
}

interface CombinedData extends MemeCoinInput, TwitterData {}

export class MemeCoinService {
  private static instance: MemeCoinService;
  private agent: any;
  private walletProvider: any;

  private constructor() {}

  public static async getInstance() {
    if (!MemeCoinService.instance) {
      MemeCoinService.instance = new MemeCoinService();
      const { agent, walletProvider } = await initializeAgent();
      MemeCoinService.instance.agent = agent;
      MemeCoinService.instance.walletProvider = walletProvider;
    }
    return MemeCoinService.instance;
  }

  async generateMemeCoin(data: MemeCoinInput): Promise<MemeCoinResponse> {
    try {
      // 1. Fetch Twitter Data
      const twitterData = await getTwitterData(data.twitter_handle);

      // 2. Combine data for processing
      const combinedData: CombinedData = {
        ...data,
        ...twitterData
      };

      // 3. Use AgentKit to generate token metadata
      const agentResponse = await this.agent.invoke({
        messages: [new HumanMessage(`
          Generate a meme coin based on this data:
          ${JSON.stringify(combinedData, null, 2)}
          
          Create appropriate json token metadata including:
          - Token name (should be creative and meme-worthy)
          - Symbol (3-4 characters)
          - Initial supply (between 1M and 1B)
          - Description (include product info and social metrics)
          
          Return the response as valid JSON.
        `)],
      });

      const tokenMetadata: TokenMetadata = JSON.parse(agentResponse.content);

      // 4. Upload metadata to IPFS
      const ipfsUri = await uploadToIPFS(tokenMetadata);

      // 5. Deploy token using CDP SDK
      const wallet = await this.walletProvider.getWallet();
      
      const token = await wallet.deployToken({
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        totalSupply: tokenMetadata.totalSupply
      });

      // 6. Return complete response
      return {
        memecoin_name: tokenMetadata.name,
        memecoin_contract: token.getContractAddress(),
        wallet_address: await wallet.getDefaultAddress(),
        ipfs_uri: ipfsUri,
        status: "minted",
        metadata: tokenMetadata
      };

    } catch (error) {
      console.error('Error generating meme coin:', error);
      throw error;
    }
  }
} 