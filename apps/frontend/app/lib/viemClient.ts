import { createPublicClient, http } from 'viem'
import { eduChainTestnet } from './eduChain'

export const client = createPublicClient({
  chain: eduChainTestnet,
  transport: http()
})
