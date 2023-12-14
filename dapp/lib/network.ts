import { MetaMaskChainInterface } from "../hooks/metamask.hook";

export const main: MetaMaskChainInterface = {
  chainId: 43113,
  chainName: "Fuji",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://avalanche-fuji-c-chain.publicnode.com"],
  blockExplorerUrls: ["https://ftmscan.com"],
};
