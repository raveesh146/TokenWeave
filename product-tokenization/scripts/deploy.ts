// scripts/deploy.ts
import { ethers } from 'hardhat'

async function main() {
    // Deploy Verifier
    const Verifier = await ethers.getContractFactory("Verifier")
    const verifier = await Verifier.deploy()
    await verifier.deployed()
    console.log("Verifier deployed to:", verifier.address)
    
    // Deploy ProductNFT
    const ProductNFT = await ethers.getContractFactory("ProductNFT")
    const productNFT = await ProductNFT.deploy(verifier.address)
    await productNFT.deployed()
    console.log("ProductNFT deployed to:", productNFT.address)
}

main().catch(console.error)