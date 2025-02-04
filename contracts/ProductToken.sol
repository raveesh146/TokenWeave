// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "node_modules/@openzeppelin/contracts/access/AccessControl.sol";
import "node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IEigenLayerOperator.sol";

contract ProductToken is ERC721, AccessControl, ReentrancyGuard {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    struct ProductData {
        bytes32 nameHash;
        bytes32 descriptionHash;
        uint256 timestamp;
        uint256 price;
        uint8 category;
        bytes32 ipfsHash;
        address altLayerAddress;
        bytes32 zkProofHash;
        bool validated;
    }
    
    mapping(uint256 => ProductData) public products;
    mapping(bytes32 => bool) public usedNullifiers;
    
    IEigenLayerOperator public eigenLayerOperator;
    
    event ProductValidated(
        uint256 indexed tokenId,
        bytes32 indexed dataHash,
        address validator
    );

    constructor(address _eigenLayerOperator) ERC721("Product Token", "PROD") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        eigenLayerOperator = IEigenLayerOperator(_eigenLayerOperator);
    }

    function validateAndMint(
        ProductData calldata data,
        bytes calldata proof,
        bytes32 nullifier
    ) external nonReentrant {
        require(hasRole(VALIDATOR_ROLE, msg.sender), "Not a validator");
        require(!usedNullifiers[nullifier], "Nullifier already used");
        
        // Verify the validator is staked in EigenLayer
        require(
            eigenLayerOperator.isOperator(msg.sender),
            "Validator not staked"
        );

        // Verify ZK proof
        require(
            verifyProof(proof, data),
            "Invalid proof"
        );

        uint256 tokenId = uint256(keccak256(abi.encode(data, block.number)));
        
        products[tokenId] = data;
        usedNullifiers[nullifier] = true;
        
        _mint(data.altLayerAddress, tokenId);
        
        emit ProductValidated(tokenId, data.zkProofHash, msg.sender);
    }

    function verifyProof(
        bytes calldata proof,
        ProductData calldata data
    ) internal view returns (bool) {
        // Implement your ZK proof verification logic here
        return true; // Placeholder
    }
} 