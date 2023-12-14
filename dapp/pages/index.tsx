"use client";
import {
  WalletContextProvider,
  useWalletContext,
} from "@/contexts/wallet.context";
import { useEGSI } from "@/hooks/egsi.hook";
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
  } = useEGSI();
  const { chain, addContract, requestChangeToChain } = useMetaMask();
  const [amount, setAmount] = useState<string>("");
  const needsChainChange = chainId !== undefined && chain.chainId !== chainId;

  console.info(`don't look at my console, get some egs instead`);

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
    console.log(approvedAmount +" and "+ amount);
    return approvedAmount?.isLessThan(amount) ?? true;
  }

  return (
    <>
      <Head>
        <title>Emin Gün Sirer $EGS</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="UTF-8" />
        <meta name="description" content="4) What? -  Emin Gün Sirer $EGS" />
      </Head>
      <main className="min-h-screen flex flex-col items-center">
        <div className="navbar">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Emin Gün Sirer</a>
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
                In Emin Gün Sirer we trust, buy<p className="text-primary">$EGS</p>
              </h2>
              <div
                className="cursor-pointer"
                onClick={() =>
                  handleAmountChanged(balanceOfInputToken?.toString() ?? "0")
                }
                onKeyDown={() => {}}
              >
                Balance: {balanceOfInputToken?.toFixed(4).toString() ?? "0"}{" "}
                <strong className="text-secondary">WAVAX</strong>
              </div>
              <div className="flex flex-row items-center">
                <input
                  type="number"
                  placeholder="Amount (max. 1) - every hour"
                  max={1}
                  className="input input-bordered input-primary w-full mr-4"
                  onWheel={(e) => e.currentTarget.blur()}
                  value={amount}
                  onChange={(e) => handleAmountChanged(e.target.value)}
                />
                <strong className="text-secondary">WAVAX</strong>
              </div>
              {estimatedReceivedTokens ? (
                <p>
                  Estimation: {estimatedReceivedTokens?.toString() ?? ""}{" "}
                  <strong className="text-primary">EGS</strong>
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
                <strong className="text-primary">EGS</strong>
              </p>
            </div>
          </div>
        )}
        {remainingSupply && inputToLP && burnedInput && swappedInput && (
          <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
            <div className="card-body">
              <h2 className="card-title">Statistics</h2>
              <p>
                Total supply: {formatNumber(10_000_000)}{" "}
                <strong className="text-primary">EGS</strong>
              </p>
              <p>
                Remaining supply:{" "}
                {formatNumber(remainingSupply?.toNumber() ?? 0)}{" "}
                <strong className="text-primary">EGS</strong> (
                {remainingSupply?.div(10_000_000).times(100).toFixed(18)}
                %)
              </p>
              <p>
                Initial price: 0.001{" "}
                <strong className="text-secondary">AVAX</strong> /{" "}
                <strong className="text-primary">EGS</strong>
              </p>
              <p>
                Max price: 1 <strong className="text-secondary">AVAX</strong> /{" "}
                <strong className="text-primary">EGS</strong>
              </p>
              <p>
                Added liquidity: {formatNumber(inputToLP?.toNumber() ?? 0)}{" "}
                <strong className="text-secondary">AVAX</strong>
              </p>
              <p>
                Swapped: {formatNumber(swappedInput?.toNumber() ?? 0)}{" "}
                <strong className="text-secondary">AVAX</strong>
              </p>
              <p className="text-sm font-normal text-slate-500">
                (Amount of AVAX which are swapped to EGS after adding to
                liquidity pool)
              </p>
            </div>
          </div>
        )}
        <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
          <div className="card-body">
            <h2 className="card-title">Infos</h2>
            <p>
              We love Emin Gün Sirer and his <strong className="text-primary">$EGS</strong>.
              He keeps building no matter what.
            </p>
            <p>
              Each purchase increases the coin price.
              Max buy is 1 AVAX per wallet each hour!
              Unsold tokens will be burnt.
            </p>
            <strong>Tokenomics</strong>
            <p>95% community allocation - 5% team allocation</p>
            <p>
              95% <strong className="text-secondary">AVAX</strong> used to
              form liquidity on TraderJoe
            </p>
            <p>
              5% <strong className="text-secondary">AVAX</strong> for marketing
            </p>
            <p>
              0% <strong className="text-secondary">AVAX</strong> trading taxes
            </p>
          </div>
        </div>
        <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl mt-16">
          <div className="card-body">
            <h2 className="card-title">Contracts</h2>

            <p className="mt-4 break-all text-sm">
              <strong className="text-primary">EGS</strong>:{" "}
              {outputTokenAddress}
            </p>
            <button
              className="btn btn-primary flex-grow"
              onClick={() =>
                outputTokenAddress && addContract(outputTokenAddress)
              }
            >
              Add EGS to MetaMask
            </button>
            <p className="mt-4 break-all text-sm">
              <strong className="text-secondary">WAVAX</strong>:{" "}
              {inputTokenAddress}
            </p>
            <button
              className="btn btn-secondary flex-grow"
              onClick={() =>
                inputTokenAddress && addContract(inputTokenAddress)
              }
            >
              Add AVAX to MetaMask
            </button>
          </div>
        </div>
        <div className="card mx-4 md:w-128 bg-slate-100 shadow-xl my-16">
          <div className="card-body">
            <h2 className="card-title">Disclaimer</h2>
            <p>
              Anyone buying or interacting with $EGS is doing so at their own
              risk. We take no responsibility whatsoever. Test in prod.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
