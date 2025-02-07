import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ProductNFT", function() {
    let productNFT: ProductNFT;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;

    beforeEach(async function() {
        [owner, addr1] = await ethers.getSigners();
        
        const ProductNFT = await ethers.getContractFactory("ProductNFT");
        productNFT = await ProductNFT.deploy();
        await productNFT.waitForDeployment();
        
        const MINTER_ROLE = await productNFT.MINTER_ROLE();
        await productNFT.grantRole(MINTER_ROLE, owner.address);
    });

    it("Should mint a new product token", async function() {
        const productData = {
            nameHash: ethers.id("Test Product"),
            descriptionHash: ethers.id("Test Description"),
            price: parseEther("1"),
            timestamp: Math.floor(Date.now() / 1000),
            ipfsURI: "ipfs://test",
            creator: owner.address
        };

        await expect(productNFT.mintProduct(
            productData,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x"
        )).to.emit(productNFT, "ProductMinted");
    });
}); 