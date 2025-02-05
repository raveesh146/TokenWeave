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
const { MemorySaver } = require("@langchain/langgraph");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { ChatOpenAI } = require("@langchain/openai");

const WALLET_DATA_FILE = './wallet-data.json';

async function initializeCdpAgent() {
  try {
    const llm = new ChatOpenAI({
      model: "gpt-4-0125-preview",
    });

    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configure(config);
    const agentkit = await initializeAgentKit(walletProvider, config);
    const agent = await createAgent(llm, agentkit);

    return { agent, agentkit, walletProvider };
  } catch (error) {
    console.error("Failed to initialize CDP agent:", error);
    throw error;
  }
}

async function initializeAgentKit(walletProvider, config) {
  return await AgentKit.from({
    walletProvider,
    actionProviders: getActionProviders(config),
  });
}

function getActionProviders(config) {
  return [
    wethActionProvider(),
    pythActionProvider(),
    walletActionProvider(),
    erc20ActionProvider(),
    cdpApiActionProvider(config),
    cdpWalletActionProvider(config),
  ];
}

async function createAgent(llm, agentkit) {
  const tools = await getLangChainTools(agentkit);
  const memory = new MemorySaver();

  return createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: getAgentPrompt()
  });
}

function getAgentPrompt() {
  return `
    You are a specialized agent for processing company information and creating meme tokens.
    Your task is to analyze company data, Twitter information, and product details to create
    appropriate token suggestions and categorizations. Use the CDP AgentKit tools to validate
    wallets and perform blockchain operations when needed.
  `;
}

module.exports = {
  initializeCdpAgent
}; 