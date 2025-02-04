import { scrapeProductData } from "./scraper";
import { processProductData } from "./server";

async function runAutonomousAgent(productUrl: string) {
  console.log("Running Autonomous Agent...");
  const data = await scrapeProductData(productUrl);
  const ipfsLink = await processProductData(data);
  console.log("Data stored at:", ipfsLink);
}

const productUrl = "https://example.com/sample-product";
runAutonomousAgent(productUrl);
