const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} = require("@coinbase/agentkit");
const { getLangChainTools } = require("@coinbase/agentkit-langchain");
const { HumanMessage } = require("@langchain/core/messages");
const { MemorySaver } = require("@langchain/langgraph");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { ChatOpenAI } = require("@langchain/openai");
const { TwitterApi } = require('twitter-api-v2');
const pinataSDK = require('@pinata/sdk');

dotenv.config();

const app = express();
app.use(express.json());

// Configure rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all routes
app.use('/api', limiter);

// Twitter rate limit handler
const twitterRateLimiter = {
  remaining: 180,
  reset: Date.now(),
  resetTimeout: null
};

async function safeTwitterRequest(fn) {
  if (twitterRateLimiter.remaining <= 0 && Date.now() < twitterRateLimiter.reset) {
    throw new Error(`Twitter rate limit exceeded. Please try again after ${new Date(twitterRateLimiter.reset).toLocaleTimeString()}`);
  }

  try {
    const result = await fn();
    twitterRateLimiter.remaining = result._rateLimit?.remaining || twitterRateLimiter.remaining - 1;
    twitterRateLimiter.reset = result._rateLimit?.reset || twitterRateLimiter.reset;
    return result;
  } catch (error) {
    if (error.code === 429) {
      twitterRateLimiter.remaining = 0;
      twitterRateLimiter.reset = Date.now() + (15 * 60 * 1000); // 15 minutes default
      throw new Error('Twitter API rate limit exceeded. Please try again in a few minutes.');
    }
    throw error;
  }
}

const WALLET_DATA_FILE = './wallet-data.json';

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Initialize Pinata
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

/**
 * Initialize CDP Agent
 */
async function initializeCdpAgent() {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4-0125-preview",
    });

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      cdpWalletData: null,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider({
          supportedChains: ['base-sepolia'],
          defaultChain: 'base-sepolia',
          config: {
            validateAddresses: true,
            allowedNetworks: ['base-sepolia']
          }
        }),
        erc20ActionProvider(),
        cdpApiActionProvider(config),
        cdpWalletActionProvider(config),
      ],
    });

    const tools = await getLangChainTools(agentkit);
    const memory = new MemorySaver();

    // Create React Agent
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a specialized agent for processing company information and creating meme tokens.
        Your task is to analyze company data, Twitter information, and product details to create
        appropriate token suggestions and categorizations.

        When validating wallet addresses:
        1. Use the wallet tools to verify the address format and network compatibility
        2. The address must be a valid Ethereum address on the base-sepolia network
        3. Respond ONLY with either:
           - "Valid wallet address" for valid addresses
           - "Invalid wallet address: [specific reason]" for invalid addresses
        4. Do not include any other text in your response for wallet validation

        For token analysis tasks:
        1. Analyze the company and product information
        2. Suggest an appropriate meme token name
        3. Categorize the product
        4. Identify the main use case
      `
    });

    return { agent, agentkit, walletProvider };
  } catch (error) {
    console.error("Failed to initialize CDP agent:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      config: {
        apiKeyName: process.env.CDP_API_KEY_NAME ? 'present' : 'missing',
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY ? 'present' : 'missing',
        networkId: process.env.NETWORK_ID
      }
    });
    throw error;
  }
}

// Initialize the CDP agent
let cdpAgent;
console.log('Starting CDP agent initialization...');
initializeCdpAgent().then(agent => {
  cdpAgent = agent;
  console.log('CDP agent initialized successfully');
}).catch(error => {
  console.error('CDP agent initialization failed:', error.message);
  console.error(error);
});

// Main endpoint for chat interface
app.post('/api/chat', async (req, res) => {
  try {
    const { message, twitterHandle, productInfo, walletAddress } = req.body;

    if (message.toLowerCase() !== 'kamkardo') {
      return res.status(400).json({ error: 'Invalid command' });
    }

    if (!cdpAgent) {
      return res.status(500).json({ error: 'CDP Agent not initialized' });
    }

    // Collect Twitter data with rate limit handling
    const tweets = await safeTwitterRequest(() => twitterClient.v2.userByUsername(twitterHandle, {
      'user.fields': ['description', 'public_metrics', 'profile_image_url']
    }));

    // Basic format validation
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    try {
      // Additional validation using agent tools
      const validationResponse = await cdpAgent.agent.invoke([
        {
          role: 'user',
          content: `Use the wallet tools to validate this address on base-sepolia network: ${walletAddress}. 
                   Check if this is a valid Ethereum address and exists on the base-sepolia network.
                   Return ONLY "Valid wallet address" if valid, or "Invalid wallet address: [reason]" if invalid.`
        }
      ]);

      console.log('Validation response:', validationResponse.content);

      if (validationResponse.content.toLowerCase().includes('invalid') || 
          validationResponse.content.toLowerCase().includes('error')) {
        console.error('Wallet validation failed:', validationResponse.content);
        return res.status(400).json({ error: 'Invalid wallet address' });
      }

      // If we get here, the wallet is valid
      console.log('Wallet validation successful');

    } catch (error) {
      console.error('Wallet validation error:', error);
      return res.status(400).json({ 
        error: 'Wallet validation failed',
        details: error.message
      });
    }

    // Process with CDP Agent
    const response = await cdpAgent.agent.invoke([
      new HumanMessage({
        content: `Analyze this company and create token suggestions:
          Company Name: ${tweets.data.name}
          Description: ${tweets.data.description}
          Product Info: ${productInfo}
          Wallet: ${walletAddress}`
      })
    ]);

    // Structure the data
    const structuredData = {
      company_name: tweets.data.name,
      meme_token_name: response.content.match(/token name: (.*)/i)?.[1] || '',
      company_information: tweets.data.description,
      product_info: productInfo,
      product_usecase: response.content.match(/use case: (.*)/i)?.[1] || '',
      product_category: response.content.match(/category: (.*)/i)?.[1] || '',
      company_wallet_address: walletAddress,
      metadata: {
        twitter_metrics: tweets.data.public_metrics,
        timestamp: new Date().toISOString(),
        network: process.env.NETWORK_ID
      }
    };

    // Store on IPFS
    const ipfsResult = await pinata.pinJSONToIPFS(structuredData, {
      pinataMetadata: {
        name: `${tweets.data.name}-token-analysis`,
        keyvalues: {
          company: tweets.data.name,
          timestamp: Date.now()
        }
      }
    });

    return res.json({
      success: true,
      ipfsHash: ipfsResult.IpfsHash,
      data: structuredData,
      agentResponse: response.content
    });

  } catch (error) {
    console.error('Error processing request:', error);
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: error.message
      });
    }
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 