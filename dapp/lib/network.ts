import { MetaMaskChainInterface } from "../hooks/metamask.hook";

export const main: MetaMaskChainInterface = {
  chainId: 43114,
  chainName: "Avalanche C-Chain",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://avalanche-c-chain.publicnode.com"],
  blockExplorerUrls: ["https://snowtrace.io"],
};
