const pinataSDK = require('@pinata/sdk');

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

async function storeData(data, companyName) {
  return await pinata.pinJSONToIPFS(data, {
    pinataMetadata: {
      name: `${companyName}-token-analysis`,
      keyvalues: {
        company: companyName,
        timestamp: Date.now()
      }
    }
  });
}

module.exports = {
  ipfsService: {
    storeData
  }
}; 