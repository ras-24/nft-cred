# Local Contract Deployment Guide

This guide walks through deploying and testing the MockNFT contract on a local blockchain.

## 1. Start Local Blockchain

Start a local Ethereum node using Anvil:

```bash
anvil
```

This will spin up a local blockchain with pre-funded accounts. Keep this terminal running.

## 2. Configure MetaMask

1. Open MetaMask
2. Add a new network with these settings:
   - Network Name: Anvil Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

3. Import the default Anvil private key to access pre-funded account:
   - In MetaMask, click "Import Account"
   - Enter private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   You now connected to wallet address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   
   This account comes pre-funded with 10000 ETH.

## 3. Deploy Contract

Open a new terminal and deploy the MockNFT contract:

```bash
cd apps/contracts
forge create --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/MockNFT.sol:MockNFT --legacy --broadcast
```

Save the deployed contract address from the output. It will look something like:
`Deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## 4. Mint NFT

Mint an NFT using Cast. Replace the contract address with your deployed address:

```bash
cast send {deployment_address} \
  "mint(address)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 5. Verify NFT

Check the NFT balance of your address:

```bash
cast call {deployment_address} \
  "balanceOf(address)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545
```

The output should show a balance of 1.

## Notes

- The contract's base URI is set to `ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/`
- Each NFT's metadata can be accessed by appending the token ID to the base URI
- The contract owner can update the base URI using the `setBaseURI` function