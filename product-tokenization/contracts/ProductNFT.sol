// contracts/ProductNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IProductVerifier.sol";

contract ProductNFT is ERC721, Ownable {
    IProductVerifier public verifier;
    mapping(uint256 => bool) public nullifierUsed;
    mapping(uint256 => string) public tokenMetadata;
    
    event ProductTokenized(
        uint256 indexed tokenId,
        string ipfsCid,
        uint256 validationHash,
        address indexed minter
    );
    
    constructor(address _verifier) ERC721("Product Token", "PROD") {
        verifier = IProductVerifier(_verifier);
    }
    
    function setVerifier(address _verifier) external onlyOwner {
        verifier = IProductVerifier(_verifier);
    }

    function mintWithProof(
        uint256[8] calldata proof,
        uint256[3] calldata publicSignals,
        string calldata ipfsCid,
        address recipient
    ) external {
        require(!nullifierUsed[publicSignals[2]], "Proof already used");
        
        require(
            verifier.verifyProof(
                proof,
                [publicSignals[0], publicSignals[1], publicSignals[2]]
            ),
            "Invalid proof"
        );

        nullifierUsed[publicSignals[2]] = true;
        
        uint256 tokenId = uint256(keccak256(abi.encodePacked(publicSignals[0])));
        _mint(recipient, tokenId);
        tokenMetadata[tokenId] = ipfsCid;
        
        emit ProductTokenized(tokenId, ipfsCid, publicSignals[0], recipient);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenMetadata[tokenId];
    }
}