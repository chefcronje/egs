"use client";
import {
  WalletContextProvider,
  useWalletContext,
} from "@/contexts/wallet.context";
import { useCronje } from "@/hooks/cronje.hook";
import { useMetaMask } from "@/hooks/metamask.hook";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";

function Home() {
  return (
    <WalletContextProvider>
      <HomeContent />
    </WalletContextProvider>
  );
}

function HomeContent() {
  const {
    isConnected,
    address,
    chain: chainId,
    connect,
    block,
  } = useWalletContext();
  const {
    reload,
    remainingSupply,
    burnedInput,
    inputToLP,
    swappedInput,
    inputTokenAddress,
    outputTokenAddress,
    estimatedReceivedTokens,
    estimateReceiveTokens,
    buyTokens,
    isBuying,
    approvedAmount,
    approveAmount,
    balanceOfInputToken,
  } = useCronje();
  const { chain, addContract, requestChangeToChain } = useMetaMask();
  const [amount, setAmount] = useState<string>("");
  const needsChainChange = chainId !== undefined && chain.chainId !== chainId;

  console.info(`don't look at my console, get some cronje instead`);

  function formatNumber(value: number): string {
    let postfix = "";
    let fixed = 0;
    if (Math.abs(value) > 1e6) {
      value = value / 1e6;
      postfix = "M";
      fixed = 2;
    } else if (Math.abs(value) > 1e3) {
      value = value / 1e3;
      postfix = "k";
      fixed = 2;
    }
    return value
      .toFixed(fixed)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      .concat(postfix);
  }

  function handleAmountChanged(value: string) {
    setAmount(value);
    estimateReceiveTokens(value);
  }

  function needsApproval(): boolean {
    return approvedAmount?.isLessThan(amount) ?? true;
  }

  return (
    <>
      <Head>
        <title>$CROJNE</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="UTF-8" />
        <meta name="description" content="Honor your chef by buying $CRONJE" />
      </Head>
      <main className="min-h-screen flex flex-col items-center">
        <div className="navbar">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Chef Cronje</a>
          </div>
          <div className="flex flex-row gap-4">
            <p className="text-sm text-slate-500 hidden md:flex">
              Block: {block}
            </p>
            <button
              className="btn btn-primary hidden md:flex"
              onClick={() => reload()}
            >
              Reload
            </button>
            {needsChainChange ? (
              <button
                className="btn btn-primary"
                onClick={() => requestChangeToChain(chain.chainId)}
              >
                {`Change network to ${chain.chainName}`}
              </button>
            ) : isConnected ? (
              <button className="btn btn-ghost" disabled>
                <p className="text-white">{`${address?.slice(
                  0,
                  4
                )}...${address?.slice(-4)}`}</p>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => connect()}>
                Connect your wallet
              </button>
            )}
          </div>
        </div>
        {isConnected ? (
          <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
            <div className="card-body">
              <h2 className="card-title">
                Honor your chef by buying <p className="text-primary">$CRONJE</p>
              </h2>
              <div
                className="cursor-pointer"
                onClick={() =>
                  handleAmountChanged(balanceOfInputToken?.toString() ?? "0")
                }
                onKeyDown={() => {}}
              >
                Balance: {balanceOfInputToken?.toFixed(2).toString() ?? "0"}{" "}
                <strong className="text-secondary">USDC (multi)</strong>
              </div>
              <div className="flex flex-row items-center">
                <input
                  type="number"
                  placeholder="Amount"
                  className="input input-bordered input-primary w-full mr-4"
                  onWheel={(e) => e.currentTarget.blur()}
                  value={amount}
                  onChange={(e) => handleAmountChanged(e.target.value)}
                />
                <strong className="text-secondary">USDC</strong>
              </div>
              {estimatedReceivedTokens ? (
                <p>
                  Estimation: {estimatedReceivedTokens?.toString() ?? ""}{" "}
                  <strong className="text-primary">CRONJE</strong>
                </p>
              ) : (
                <p>
                  Estimation:{" "}
                  <strong className="text-sm font-normal text-slate-500">
                    Please enter an amount
                  </strong>
                </p>
              )}
              <button
                className="btn btn-block btn-primary"
                onClick={() =>
                  needsApproval() ? approveAmount(amount) : buyTokens(amount)
                }
              >
                {isBuying ? (
                  <span className="loading loading-dots loading-sm"></span>
                ) : needsApproval() ? (
                  "Approve"
                ) : (
                  "Buy"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
            <div className="card-body">
              <p>
                Please connect your wallet to be able to receive{" "}
                <strong className="text-primary">CRONJE</strong>
              </p>
            </div>
          </div>
        )}
        {remainingSupply && inputToLP && burnedInput && swappedInput && (
          <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
            <div className="card-body">
              <h2 className="card-title">Statistics</h2>
              <p>
                Total supply: {formatNumber(3_000_000)}{" "}
                <strong className="text-primary">CRONJE</strong>
              </p>
              <p>
                Remaining supply:{" "}
                {formatNumber(remainingSupply?.toNumber() ?? 0)}{" "}
                <strong className="text-primary">CRONJE</strong> (
                {remainingSupply?.div(3_000_000).times(100).toFixed(8)}
                %)
              </p>
              <p>
                Initial price: 1{" "}
                <strong className="text-secondary">USDC</strong> /{" "}
                <strong className="text-primary">CRONJE</strong>
              </p>
              <p>
                Max price: 100 <strong className="text-secondary">USDC</strong> /{" "}
                <strong className="text-primary">CRONJE</strong>
              </p>
              <p>Burn rate: 66.7%</p>
              <p>
                Added liquidity: {formatNumber(inputToLP?.toNumber() ?? 0)}{" "}
                <strong className="text-secondary">USDC</strong>
              </p>
              <p>
                Burned: {formatNumber(burnedInput?.toNumber() ?? 0)}{" "}
                <strong className="text-secondary">USDC</strong>
              </p>
              <p>
                Swapped: {formatNumber(swappedInput?.toNumber() ?? 0)}{" "}
                <strong className="text-secondary">USDC</strong>
              </p>
              <p className="text-sm font-normal text-slate-500">
                (Amount of USDC which are swapped to CRONJE after adding to
                liquidity pool)
              </p>
            </div>
          </div>
        )}
        <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
          <div className="card-body">
            <h2 className="card-title">Infos</h2>
            <p>
              We love <strong className="text-primary">$CRONJE</strong>, and he keeps cooking till the bridge is back up, or not.
            </p>
            <p>
              Each purchase increases the coin price up to a cap of 100{" "}
              <strong className="text-secondary">USDC</strong>.
            </p>
            <p>
              66.67% <strong className="text-secondary">USDC</strong> burned
            </p>
            <p>
              33.33% <strong className="text-secondary">USDC</strong> used to
              form liquidity on Wigo Swap
            </p>
            <strong>Tokenomics</strong>
            <p>100% community allocation - 0% team allocation</p>
          </div>
        </div>
        <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
          <div className="card-body">
            <h2 className="card-title">Contracts</h2>

            <p className="mt-4 break-all text-sm">
              <strong className="text-primary">CRONJE</strong>:{" "}
              {outputTokenAddress}
            </p>
            <button
              className="btn btn-primary flex-grow"
              onClick={() =>
                outputTokenAddress && addContract(outputTokenAddress)
              }
            >
              Add CRONJE to MetaMask
            </button>
            <p className="mt-4 break-all text-sm">
              <strong className="text-secondary">USDC</strong>:{" "}
              {inputTokenAddress}
            </p>
            <button
              className="btn btn-secondary flex-grow"
              onClick={() =>
                inputTokenAddress && addContract(inputTokenAddress)
              }
            >
              Add USDC to MetaMask
            </button>
          </div>
        </div>
        <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl my-16">
          <div className="card-body">
            <h2 className="card-title">Disclaimer</h2>
            <p>
              Anyone buying or interacting with $CRONJE is doing so at their own
              risk. We take no responsibility whatsoever. Test in prod.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
