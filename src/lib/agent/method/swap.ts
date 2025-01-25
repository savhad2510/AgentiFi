// src/lib/agent/method/swap.ts

import { Account } from "Mantle";
import { executeSwap, fetchQuotes, type QuoteRequest, type Quote } from "@avnu/avnu-sdk";
import { tokenAddresses } from "src/lib/constant";
import { MantleAgent } from "../MantleAgent";
import { symbolToDecimal } from "src/lib/utils/symbolToDecimal";

// Define constants
const AVNU_CONTRACT_ADDRESS = "0x04270219d365d6b017231b52e92b3fb5d7c8378b25649d51b308464ba6ef936";

// Types
export type SwapParams = {
  sellTokenSymbol: string;
  buyTokenSymbol: string;
  sellAmount: number;
};

export const swapTokens = async (params: SwapParams, privateKey: string) => {
  try {
    // Validate wallet address
    const walletAddress = process.env.PUBLIC_ADDRESS;
    if (!walletAddress) {
      throw new Error("Wallet address not configured in environment variables");
    }

    // Initialize MantleAgent
    const agent = new MantleAgent({
      walletPrivateKey: privateKey,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create account instance
    const account = new Account(
      agent.contractInteractor.provider,
      walletAddress,
      privateKey
    );

    // Validate tokens and get addresses
    const sellTokenAddress = tokenAddresses[params.sellTokenSymbol];
    const buyTokenAddress = tokenAddresses[params.buyTokenSymbol];

    if (!sellTokenAddress) {
      throw new Error(`Sell token ${params.sellTokenSymbol} not supported`);
    }
    if (!buyTokenAddress) {
      throw new Error(`Buy token ${params.buyTokenSymbol} not supported`);
    }

    // Format amount with correct decimals
    const sellDecimals = symbolToDecimal(params.sellTokenSymbol);
    const formattedAmount = BigInt(
      agent.contractInteractor.formatTokenAmount(
        params.sellAmount.toString(),
        sellDecimals
      )
    );

    // Check if amount is too small
    if (formattedAmount <= BigInt(0)) {
      throw new Error("Swap amount too small");
    }

    // First check allowance and approve if needed
    const allowance = await checkAllowance(
      account,
      sellTokenAddress,
      formattedAmount
    );
    if (!allowance.sufficient) {
      console.log("Insufficient allowance, approving token...");
      const approvalTx = await approveToken(
        account,
        sellTokenAddress,
        formattedAmount
      );
      await agent.contractInteractor.provider.waitForTransaction(
        approvalTx.transaction_hash,
        { retryInterval: 1000 }
      );
    }

    // Prepare quote request
    const quoteParams: QuoteRequest = {
      sellTokenAddress,
      buyTokenAddress,
      sellAmount: formattedAmount,
      takerAddress: account.address,
      size: 1
    };

    console.log("Fetching quotes with params:", {
      ...quoteParams,
      sellAmount: formattedAmount.toString()
    });

    // Fetch quotes
    const quotes = await fetchQuotes(quoteParams);
    if (!quotes || quotes.length === 0) {
      throw new Error("No quotes available for this swap");
    }

    const bestQuote: Quote = quotes[0];
    console.log("Best quote:", {
      sellAmount: bestQuote.sellAmount,
      buyAmount: bestQuote.buyAmount,
      // Access other available properties from the Quote type
    });

    // Execute swap with proper configuration
    const swapResult = await executeSwap(account, bestQuote, {
      slippage: 0.5 // 0.5% slippage tolerance
    });

    console.log("Swap executed, hash:", swapResult.transactionHash);

    // Monitor transaction
    const receipt = await agent.transactionMonitor.waitForTransaction(
      swapResult.transactionHash,
      (status) => console.log("Swap status:", status)
    );

    // Get transaction events
    const events = await agent.transactionMonitor.getTransactionEvents(
      swapResult.transactionHash
    );

    return JSON.stringify({
      status: "success",
      message: `Successfully swapped ${params.sellAmount} ${params.sellTokenSymbol} for ${params.buyTokenSymbol}`,
      transactionHash: swapResult.transactionHash,
      receipt,
      events,
      details: {
        sellAmount: params.sellAmount,
        sellToken: params.sellTokenSymbol,
        buyToken: params.buyTokenSymbol
      }
    });
  } catch (error) {
    console.error("Swap error:", error);
    return JSON.stringify({
      status: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
      step: "swap execution"
    });
  }
};

// Helper function to check token allowance
async function checkAllowance(
  account: Account,
  tokenAddress: string,
  amount: bigint
): Promise<{ sufficient: boolean; current: bigint }> {
  try {
    const allowanceCall = {
      contractAddress: tokenAddress,
      entrypoint: "allowance",
      calldata: [account.address, AVNU_CONTRACT_ADDRESS]
    };

    const response = await account.callContract(allowanceCall);
    const currentAllowance = BigInt(response[0]); // Access first element directly

    return {
      sufficient: currentAllowance >= amount,
      current: currentAllowance
    };
  } catch (error) {
    console.error("Error checking allowance:", error);
    throw error;
  }
}

// Helper function to approve token spending
async function approveToken(
  account: Account,
  tokenAddress: string,
  amount: bigint
) {
  try {
    return await account.execute({
      contractAddress: tokenAddress,
      entrypoint: "approve",
      calldata: [AVNU_CONTRACT_ADDRESS, amount.toString(), "0"]
    });
  } catch (error) {
    console.error("Error approving token:", error);
    throw error;
  }
}