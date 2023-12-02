import { MetaMaskChainInterface } from "../hooks/metamask.hook";

export const main: MetaMaskChainInterface = {
  chainId: 250,
  chainName: "Fantom",
  nativeCurrency: {
    name: "Fantom",
    symbol: "FTM",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.ankr.com/fantom"],
  blockExplorerUrls: ["https://ftmscan.com"],
};
