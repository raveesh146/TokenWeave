// scripts/tokenize.ts
import { ethers } from 'hardhat'
import { create } from 'ipfs-http-client'
import { groth16 } from 'snarkjs'
import { poseidon } from 'circomlibjs'
require('dotenv').config()

interface ProductData {
    name: string;
    description: string;
    price: bigint;
    category: number;
    ipfsUri: string;
    companyAddress: string;
}

const LAGRANGE_ENDPOINT = process.env.LAGRANGE_ENDPOINT
const LAGRANGE_API_KEY = process.env.LAGRANGE_API_KEY

async function uploadToIPFS(data: any) {
    const ipfs = create({ 
        url: process.env.IPFS_NODE || 'https://ipfs.infura.io:5001/api/v0',
        headers: {
            authorization: `Bearer ${process.env.IPFS_PROJECT_SECRET}`
        }
    })
    
    const result = await ipfs.add(JSON.stringify(data))
    return result.cid.toString()
}

async function generateProof(input: any) {
    const response = await fetch(`${LAGRANGE_ENDPOINT}/api/v1/prove`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LAGRANGE_API_KEY}`
        },
        body: JSON.stringify({
            circuitId: 'product_launch',
            inputs: input
        })
    })
    
    return await response.json()
}

async function tokenizeProduct(productData: ProductData) {
    // 1. Upload product data to IPFS
    const ipfsCid = await uploadToIPFS(productData)
    
    // 2. Prepare circuit inputs
    const validatorSecret = ethers.utils.randomBytes(32)
    const input = {
        productName: ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(productData.name))),
        description: ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(productData.description))),
        ipfsHash: ethers.utils.arrayify(ipfsCid),
        sourceData: ethers.utils.arrayify(ethers.utils.keccak256(JSON.stringify(productData))),
        validatorSecret: ethers.BigNumber.from(validatorSecret).toString(),
        category: productData.category,
        validatorHash: poseidon([validatorSecret])
    }
    
    // 3. Generate proof using Lagrange
    const { proof, publicSignals } = await generateProof(input)
    
    // 4. Get contract and signer
    const ProductNFT = await ethers.getContractFactory("ProductNFT")
    const contract = ProductNFT.attach(process.env.PRODUCT_NFT_ADDRESS!)
    
    // 5. Submit transaction
    const tx = await contract.mintWithProof(
        proof,
        publicSignals,
        ipfsCid,
        productData.companyAddress
    )
    
    return await tx.wait()
}

// Usage example
async function main() {
    const productData: ProductData = {
        name: "Example Product",
        description: "This is a test product",
        price: ethers.utils.parseEther("1"),
        category: 1,
        ipfsUri: "",
        companyAddress: "0x..."  // Your company address
    }
    
    const receipt = await tokenizeProduct(productData)
    console.log("Product tokenized:", receipt.transactionHash)
}

main().catch(console.error)