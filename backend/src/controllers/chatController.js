const { twitterService } = require('../services/twitterService');
const { ipfsService } = require('../services/ipfsService');
const { structureData } = require('../utils/dataStructurer');

async function processChat(req, res) {
  try {
    const { message, twitterHandle, productInfo, walletAddress } = req.body;

    if (message.toLowerCase() !== 'kamkardo') {
      return res.status(400).json({ error: 'Invalid command' });
    }

    if (!global.cdpAgent) {
      return res.status(500).json({ error: 'CDP Agent not initialized' });
    }

    // Collect Twitter data
    const twitterData = await twitterService.collectData(twitterHandle);

    // Validate wallet using CDP AgentKit
    const isValid = await global.cdpAgent.agentkit.validateAddress(walletAddress);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Process with CDP Agent
    const response = await global.cdpAgent.agent.invoke([
      {
        role: 'user',
        content: `Analyze this company and create token suggestions:
          Company Name: ${twitterData.name}
          Description: ${twitterData.description}
          Product Info: ${productInfo}
          Wallet: ${walletAddress}`
      }
    ]);

    // Structure the data
    const structuredData = structureData(twitterData, productInfo, walletAddress, response);

    // Store on IPFS
    const ipfsResult = await ipfsService.storeData(structuredData, twitterData.name);

    return res.json({
      success: true,
      ipfsHash: ipfsResult.IpfsHash,
      data: structuredData,
      agentResponse: response.content
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  processChat
}; 