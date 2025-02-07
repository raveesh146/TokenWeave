pragma circom 2.1.4;
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/gates.circom";

// Check if value is within range
template CheckRange(bits) {
    signal input in;
    signal input min;
    signal input max;
    signal output out;
    
    component n2b = Num2Bits(bits);
    n2b.in <== in;
    
    component gtMin = GreaterThan(bits);
    gtMin.in[0] <== in;
    gtMin.in[1] <== min;
    
    component ltMax = LessThan(bits);
    ltMax.in[0] <== in;
    ltMax.in[1] <== max;

    component andGate = AND();
    andGate.a <== gtMin.out;
    andGate.b <== ltMax.out;
    out <== andGate.out;
}

// Verify IPFS hash prefix (Qm)
template VerifyIPFSPrefix() {
    signal input hash[32]; // 256-bit hash
    
    // Check first two bytes are "Qm"
    hash[0] === 81; // 'Q'
    hash[1] === 109; // 'm'
}

// Verify product data structure and format
template VerifyProductData() {
    // Product inputs
    signal input name[32];          // Product name hash
    signal input description[32];    // Description hash
    signal input timestamp;         // Launch timestamp
    signal input price;            // Product price in wei
    signal input category;         // Product category
    
    // Metadata
    signal input ipfsHash[32];     // IPFS CID of complete product data
    signal input altLayerAddress;  // AltLayer company address
    
    // Validation outputs
    signal output dataHash;        // Combined hash of all product data
    signal output valid;           // Validation result

    // Verify timestamp is current
    component timeCheck = LessThan(64);
    timeCheck.in[0] <== timestamp;
    timeCheck.in[1] <== timestamp + 3600; // Must be within 1 hour of submission

    // Price range check (0.01 ETH to 1000 ETH)
    component priceCheck = CheckRange(160);
    priceCheck.in <== price;
    priceCheck.min <== 10000000000000000; // 0.01 ETH
    priceCheck.max <== 1000000000000000000000; // 1000 ETH

    // Hash all product data
    component hasher = Poseidon(7);
    hasher.inputs[0] <== name[0];
    hasher.inputs[1] <== description[0];
    hasher.inputs[2] <== timestamp;
    hasher.inputs[3] <== price;
    hasher.inputs[4] <== category;
    hasher.inputs[5] <== ipfsHash[0];
    hasher.inputs[6] <== altLayerAddress;

    dataHash <== hasher.out;
    component andGate = AND();
    andGate.a <== timeCheck.out;
    andGate.b <== priceCheck.out;
    valid <== andGate.out;
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

    component productVerifier = VerifyProductData();
    // Connect inputs
    productVerifier.name <== productName;
    productVerifier.description <== description;
    productVerifier.timestamp <== validatorSecret; // Using this as timestamp for demo
    productVerifier.price <== 1000000000000000000; // 1 ETH default
    productVerifier.category <== category;
    productVerifier.ipfsHash <== ipfsHash;
    productVerifier.altLayerAddress <== validatorHash; // Using this as address for demo

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
