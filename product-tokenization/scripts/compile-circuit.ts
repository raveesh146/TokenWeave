// scripts/compile-circuit.ts
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'

const execAsync = promisify(exec)

async function main() {
    // 1. Compile circuit
    await execAsync('circom circuits/product_launch.circom --r1cs --wasm --sym')
    
    // 2. Generate zkey
    await execAsync('snarkjs groth16 setup product_launch.r1cs pot12_final.ptau circuit_0000.zkey')
    
    // 3. Export verification key
    await execAsync('snarkjs zkey export verificationkey circuit_0000.zkey verification_key.json')
    
    // 4. Generate Solidity verifier
    await execAsync('snarkjs zkey export solidityverifier circuit_0000.zkey contracts/ProductVerifier.sol')
}

main().catch(console.error)