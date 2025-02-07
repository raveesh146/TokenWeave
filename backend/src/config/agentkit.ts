import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
} from "@coinbase/agentkit";
import { ChatOpenAI } from "@langchain/openai";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { config } from './env';

export async function initializeAgent() {
  // Initialize LLM
  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
  });

  // Configure CDP Wallet Provider
  const walletProvider = await CdpWalletProvider.configureWithWallet({
    apiKeyName: config.CDP_API_KEY_NAME,
    apiKeyPrivateKey: config.CDP_API_KEY_PRIVATE_KEY,
    networkId: config.NETWORK_ID,
  });

  // Initialize AgentKit
  const agentkit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      wethActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      cdpApiActionProvider({
        apiKeyName: config.CDP_API_KEY_NAME,
        apiKeyPrivateKey: config.CDP_API_KEY_PRIVATE_KEY,
      }),
      cdpWalletActionProvider({
        apiKeyName: config.CDP_API_KEY_NAME,
        apiKeyPrivateKey: config.CDP_API_KEY_PRIVATE_KEY,
      }),
    ],
  });

  const tools = await getLangChainTools(agentkit);
  const memory = new MemorySaver();

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
      You are a specialized agent for generating meme coins. Your task is to:
      1. Analyze the provided Twitter data and product information
      2. Generate appropriate token metadata
      3. Create and deploy ERC20 tokens using the CDP SDK
      4. Ensure all generated content is appropriate and follows best practices
      
      Be creative but responsible when generating meme coin details.
    `,
  });

  return { agent, walletProvider };
} 