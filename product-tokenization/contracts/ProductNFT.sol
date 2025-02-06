// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IProductVerifier.sol"; // Generated from circom circuit

contract ProductNFT is ERC721 {
    IProductVerifier public verifier;
    mapping(uint256 => bool) public nullifierUsed;
    
    constructor(address _verifier) ERC721("Product Token", "PROD") {
        verifier = IProductVerifier(_verifier);
    }

    function mintWithProof(
        uint256[8] calldata proof,
        uint256[3] calldata publicSignals,
        string calldata ipfsCid,
        address recipient
    ) external {
        // Public signals: [validationHash, mintAmount, nullifier]
        require(!nullifierUsed[publicSignals[2]], "Proof already used");
        
        // Verify the proof
        require(
            verifier.verifyProof(proof, publicSignals),
            "Invalid proof"
        );

        // Mark nullifier as used
        nullifierUsed[publicSignals[2]] = true;

        // Mint NFT
        uint256 tokenId = uint256(keccak256(abi.encodePacked(publicSignals[0])));
        _mint(recipient, tokenId);
        
        emit ProductTokenized(tokenId, ipfsCid, publicSignals[0]);
    }

    event ProductTokenized(
        uint256 indexed tokenId,
        string ipfsCid,
        uint256 validationHash
    );
}