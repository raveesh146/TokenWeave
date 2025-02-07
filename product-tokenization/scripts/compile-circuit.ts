// scripts/compile-circuit.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import path from 'path';

async function main() {
    const circuitName = "product_launch";
    
    // Create directories
    execSync('mkdir -p build/circuits');
    
    console.log("1. Compiling circuit...");
    execSync(`circom circuits/${circuitName}.circom --r1cs --wasm --sym -o build/circuits`);
    
    // Change to build/circuits directory
    process.chdir('build/circuits');
    
    console.log("2. Downloading Powers of Tau file...");
    if (!fs.existsSync("powersOfTau28_hez_final_12.ptau")) {
        execSync('curl -o powersOfTau28_hez_final_12.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau');
    }
    
    console.log("3. Generating zkey files...");
    execSync(`snarkjs groth16 setup ${circuitName}.r1cs powersOfTau28_hez_final_12.ptau circuit_0000.zkey`);
    
    console.log("4. Contributing to ceremony...");
    execSync('snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey -e="random text"');
    
    console.log("5. Exporting verification key...");
    execSync('snarkjs zkey export verificationkey circuit_final.zkey verification_key.json');
    
    console.log("6. Generating Solidity verifier...");
    // Go back to project root before generating the verifier
    process.chdir('../..');
    execSync('mkdir -p contracts');
    execSync('snarkjs zkey export solidityverifier build/circuits/circuit_final.zkey contracts/ProductVerifier.sol');
    
    console.log("Circuit compilation completed!");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});