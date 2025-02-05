const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function collectData(twitterHandle) {
  const tweets = await twitterClient.v2.userByUsername(twitterHandle, {
    'user.fields': ['description', 'public_metrics', 'profile_image_url']
  });
  
  return tweets.data;
}

module.exports = {
  twitterService: {
    collectData
  }
}; 