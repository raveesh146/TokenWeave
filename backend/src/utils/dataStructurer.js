function structureData(twitterData, productInfo, walletAddress, agentResponse) {
  return {
    company_name: twitterData.name,
    meme_token_name: extractFromResponse(agentResponse.content, 'token name'),
    company_information: twitterData.description,
    product_info: productInfo,
    product_usecase: extractFromResponse(agentResponse.content, 'use case'),
    product_category: extractFromResponse(agentResponse.content, 'category'),
    company_wallet_address: walletAddress,
    metadata: {
      twitter_metrics: twitterData.public_metrics,
      timestamp: new Date().toISOString(),
      network: process.env.NETWORK_ID
    }
  };
}

function extractFromResponse(content, field) {
  return content.match(new RegExp(`${field}: (.*?)(?:\n|$)`, 'i'))?.[1] || '';
}

module.exports = {
  structureData
}; 