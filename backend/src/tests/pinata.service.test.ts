import { uploadToIPFS } from '../services/pinata.service';

async function testPinataService() {
  try {
    console.log('Testing Pinata Service...');
    
    
    const testMetadata = {
      name: "TestCoin",
      symbol: "TEST",
      totalSupply: 1000000,
      description: "Test coin for testing IPFS upload",
      image: "https://example.com/image.png",
      attributes: {
        type: "test",
        version: "1.0"
      }
    };
    
    console.log('Uploading test metadata to IPFS...');
    const ipfsUri = await uploadToIPFS(testMetadata);
    console.log('IPFS URI:', ipfsUri);
    
    console.log('Pinata Service Test: SUCCESS ');
  } catch (error) {
    console.error('Pinata Service Test: FAILED ');
    console.error('Error:', error);
  }
}

testPinataService(); 