import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runTests() {
  console.log(' Starting Service Tests\n');

  try {
    
    console.log(' Testing Twitter Service...');
    await execAsync('ts-node src/tests/twitter.service.test.ts');
    console.log('\n');

    
    console.log(' Testing Pinata Service...');
    await execAsync('ts-node src/tests/pinata.service.test.ts');
    console.log('\n');

    
    console.log(' Testing AgentKit...');
    await execAsync('ts-node src/tests/agentkit.test.ts');
    console.log('\n');

    console.log(' All tests completed successfully!');
  } catch (error) {
    console.error(' Test suite failed:', error);
  }
}

runTests(); 