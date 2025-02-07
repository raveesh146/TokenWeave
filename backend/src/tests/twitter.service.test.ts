import { getTwitterData } from '../services/twitter.service';

async function testTwitterService() {
  try {
    console.log('Testing Twitter Service...');
    
    
    const twitterHandle = '@coinbase';
    console.log(`Fetching data for ${twitterHandle}...`);
    
    const data = await getTwitterData(twitterHandle);
    console.log('Twitter Data:', JSON.stringify(data, null, 2));
    
    console.log('Twitter Service Test: SUCCESS ');
  } catch (error) {
    console.error('Twitter Service Test: FAILED ');
    console.error('Error:', error);
  }
}

testTwitterService(); 