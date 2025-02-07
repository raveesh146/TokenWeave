import { TwitterApi } from 'twitter-api-v2';
import { config } from '../config/env';
import NodeCache from 'node-cache';

// Initialize cache with 15 minute TTL
const twitterCache = new NodeCache({ stdTTL: 900 });

export interface TwitterData {
  profile: {
    name: string;
    bio: string;
    followers: number;
  };
  tweets: string[];
}

export async function getTwitterData(handle: string): Promise<TwitterData> {
  const cacheKey = `twitter_${handle.toLowerCase()}`;
  
  // Check cache first
  const cachedData = twitterCache.get<TwitterData>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Initialize client with bearer token
    if (!config.TWITTER_BEARER_TOKEN) {
      throw new Error('Twitter Bearer Token is not configured');
    }

    const twitterClient = new TwitterApi(config.TWITTER_BEARER_TOKEN);
    const username = handle.replace('@', '');

    // Get user data with error handling
    const user = await twitterClient.v2.userByUsername(username, {
      'user.fields': ['description', 'public_metrics']
    });

    if (!user.data) {
      throw new Error(`Twitter user ${username} not found`);
    }

    // Get recent tweets
    const tweets = await twitterClient.v2.userTimeline(user.data.id, {
      max_results: 10,
      exclude: ['retweets', 'replies']
    });

    const twitterData = {
      profile: {
        name: user.data.name,
        bio: user.data.description || '',
        followers: user.data.public_metrics?.followers_count || 0
      },
      tweets: tweets.data.data.map(tweet => tweet.text)
    };

    // Store in cache
    twitterCache.set(cacheKey, twitterData);

    return twitterData;
  } catch (error: any) {
    console.error('Error fetching Twitter data:', error);
    throw new Error(`Failed to fetch Twitter data: ${error.message}`);
  }
}