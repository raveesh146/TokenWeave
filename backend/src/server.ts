import { ChatOpenAI } from "@langchain/openai";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Pinata
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY!,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY!,
});

// Initialize AI Chatbot
const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Store Data on IPFS
export async function storeDataOnIPFS(data: object) {
  try {
    const result = await pinata.pinJSONToIPFS(data);
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("Error storing on IPFS:", error);
    return null;
  }
}

// Process Data Using AI & Store on IPFS
export async function processProductData(productData: object) {
  console.log("Processing with AI...");
  const aiSummary = await chat.call(`Summarize this product: ${JSON.stringify(productData)}`);

  console.log("Storing structured data on IPFS...");
  return await storeDataOnIPFS({
    productData,
    aiSummary: aiSummary.content,
  });
}
