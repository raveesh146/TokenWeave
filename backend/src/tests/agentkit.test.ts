import { initializeAgent } from '../config/agentkit';
import { HumanMessage } from "@langchain/core/messages";
import { AIMessage } from "@langchain/core/messages";

async function testAgentKit() {
  try {
    console.log('Testing AgentKit Setup...');
    
    console.log('Initializing agent...');
    const { agent, walletProvider } = await initializeAgent();
    
    
    console.log('Testing wallet provider...');
    const address = await walletProvider.getAddress();
    console.log('Wallet address:', address);
    
    
    console.log('Testing agent with sample prompt...');
    const testData = {
      company_name: "Test Company",
      product_name: "Amazing Product",
      twitter_handle: "@test",
      product_info: "Revolutionary product that changes lives",
      profile: {
        name: "Test Account",
        bio: "Testing things",
        followers: 1000
      },
      tweets: ["Excited to launch our product!", "Great news coming soon!"]
    };

    const response = await agent.invoke(
      {
        messages: [new HumanMessage(`
          Generate a meme coin based on this test data:
          ${JSON.stringify(testData, null, 2)}
          
          Create appropriate token metadata including:
          - Token name
          - Symbol
          - Initial supply
          - Description
          
          Return the response as valid JSON.
        `)],
      },
      {
        configurable: {
          thread_id: "test-agent-thread"
        }
      }
    );

    
    const aiMessage = response.messages[0] as AIMessage;
    console.log('Agent Response:', aiMessage.content);
    
    console.log('AgentKit Test: SUCCESS ');
  } catch (error) {
    console.error('AgentKit Test: FAILED ');
    console.error('Error:', error);
  }
}

testAgentKit();