interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
  networkVersion?: string;
  chainId?: string;
}

declare global {
  interface Window {
    ethereum: Ethereum;
  }
}

export {};