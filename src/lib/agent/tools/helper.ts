// src/lib/agent/tools/helper.ts

import { MantleAgent } from "../mantleAgent";
import { MantleAgentInterface } from "../../../agents/interfaces/agent.interface";

/**
 * Type guard to check if an agent implements the full MantleAgent class
 */
export function isMantleAgentClass(agent: MantleAgentInterface | MantleAgent): agent is MantleAgent {
  return 'validateConfig' in agent;
}

/**
 * Wraps a function to inject the wallet private key from the agent
 */
export const withWalletKey = <T>(
  fn: (params: T, privateKey: string) => Promise<any>,
  agent: MantleAgentInterface | MantleAgent,
) => {
  return (params: T) => fn(params, agent.getCredentials().walletPrivateKey);
};