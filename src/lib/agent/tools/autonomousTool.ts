// src/lib/agent/tools/autonomousTool.ts

import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { StrategyAnalyzer } from "../strategy/StrategyAnalyzer";
import { MantleAgent } from "../mantleAgent";
import { fetchQuotes } from "@avnu/avnu-sdk";

const analyzeWalletSchema = z.object({
  address: z.string().describe("The wallet address to analyze"),
});

export const createAutonomousTools = (agent: MantleAgent) => [
  tool(async ({ address }: { address: string }) => {
    try {
      const analyzer = new StrategyAnalyzer(
        agent.accountManager,
        agent.contractInteractor
      );

      const recommendations = await analyzer.recommendActions(address);
      
      return JSON.stringify({
        status: "success",
        recommendations,
      });
    } catch (error) {
      return JSON.stringify({
        status: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, {
    name: "analyze_wallet_opportunities",
    description: "Analyzes a wallet's state and recommends possible actions based on available assets",
    schema: analyzeWalletSchema,
  })
];