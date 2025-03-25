# nft-cred
Turn NFTs into Borrowing Power

## Getting Started
This guide walks through setting up the project locally and deploying the MockNFT contract for testing.

### Prerequisites
1. [pnpm](https://pnpm.io/installation) package manager
2. [Foundry](https://book.getfoundry.sh/getting-started/installation) tools (Anvil, Forge, Cast)
3. [MetaMask](https://metamask.io/download/) wallet

### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/ras-24/nft-cred.git
   ```
2. Go to nft-cred frontend directory
   ```sh
   cd nft-cred/apps/frontend/
   ```
3. Install dependencies
   ```sh
   pnpm install
   ```
4. Go to root directory
   ```sh
   cd ../..
   ```
5. Run frontend project
   ```sh
   pnpm dev:frontend
   ```
6. Build frontend project
   ```sh
   pnpm build:frontend
   ```
7. Run backend project
   ```sh
   pnpm dev:contracts
   ```
8. Build backend project
   ```sh
   pnpm build:contracts
   ```
9. Build backend, frontend & run frontend project
   ```sh
   pnpm start
   ```

## Local Contract Deployment

For detailed instructions on deploying and testing the MockNFT contract locally, please refer to the [Local Contract Deployment Guide](LOCAL_DEPLOYMENT.md).

## Notes

- The contract's base URI is set to `ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/`
- Each NFT's metadata can be accessed by appending the token ID to the base URI
- The contract owner can update the base URI using the `setBaseURI` function

## License

Distributed under the MIT License. See `LICENSE` for more information.
