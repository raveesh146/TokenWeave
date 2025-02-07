import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  CDP_API_KEY_NAME: process.env.CDP_API_KEY_NAME,
  CDP_API_KEY_PRIVATE_KEY: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  NETWORK_ID: process.env.NETWORK_ID || "base-sepolia",
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
  TWITTER_API_KEY: process.env.TWITTER_API_KEY,
  TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
}; 