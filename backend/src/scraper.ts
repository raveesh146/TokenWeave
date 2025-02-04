import { AgentKit, cdpApiActionProvider } from "@coinbase/agentkit";
import dotenv from "dotenv";

dotenv.config();

// Scrape Product Data Using AgentKit
export async function scrapeProductData(productUrl: string) {
  const agent = new AgentKit({
    providers: [cdpApiActionProvider()],
  });

  const response = await agent.run({
    prompt: `Extract product details from ${productUrl}`,
  });

  return response;
}
