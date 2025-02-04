pragma circom 2.1.4;
include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/gates.circom";

// Check if value is within range
template CheckRange(bits) {
    signal input in;
    signal input min;
    signal input max;
    
    component n2b = Num2Bits(bits);
    n2b.in <== in;
    
    component gtMin = GreaterThan(bits);
    gtMin.in[0] <== in;
    gtMin.in[1] <== min;
    gtMin.out === 1;
    
    component ltMax = LessThan(bits);
    ltMax.in[0] <== in;
    ltMax.in[1] <== max;
    ltMax.out === 1;
}

// Verify IPFS hash prefix (Qm)
template VerifyIPFSPrefix() {
    signal input hash[32]; // 256-bit hash
    
    // Check first two bytes are "Qm"
    hash[0] === 81; // 'Q'
    hash[1] === 109; // 'm'
}

// Main product verification circuit
template ProductLaunchVerifier() {
    // Private inputs
    signal input productName[32];    // Hash of full product name
    signal input description[32];    // Hash of full description
    signal input ipfsHash[32];       // IPFS content identifier
    signal input sourceData[32];     // Hash of source data
    signal input validatorSecret;    // Validator's secret

    // Public inputs
    signal input category;           // Product category
    signal input validatorHash;      // Public validator hash

    // Public outputs
    signal output validationHash;    // Hash of all validated data
    signal output mintAmount;        // Amount of tokens to mint
    signal output nullifier;         // Prevents double-tokenization

    // Add category range check
    component categoryCheck = CheckRange(8);
    categoryCheck.in <== category;
    categoryCheck.min <== 1;
    categoryCheck.max <== 100;

    // Verify validator
    component validatorHasher = Poseidon(1);
    validatorHasher.inputs[0] <== validatorSecret;
    validatorHasher.out === validatorHash;  // Compare with public hash

    // 3️⃣ Verify IPFS Hash Format
    component ipfsCheck = VerifyIPFSPrefix();
    ipfsCheck.hash <== ipfsHash;


    // 5️⃣ Compute Validation Hash (Hash of All Inputs)
    component hasher = Poseidon(5);
    hasher.inputs[0] <== productName[0];
    hasher.inputs[1] <== description[0];
    hasher.inputs[2] <== ipfsHash[0];
    hasher.inputs[3] <== sourceData[0];
    hasher.inputs[4] <== category;

    validationHash <== hasher.out;

    // Compute nullifier
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== validationHash;
    nullifierHasher.inputs[1] <== validatorSecret;
    nullifier <== nullifierHasher.out;

    // Calculate mint amount
    signal baseAmount;
    baseAmount <== 1000;
}

component main {public [category, validatorHash]} = ProductLaunchVerifier();
