interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    isMetaMask?: boolean;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    selectedAddress?: string | null;
    networkVersion?: string;
    chainId?: string;
  };
}