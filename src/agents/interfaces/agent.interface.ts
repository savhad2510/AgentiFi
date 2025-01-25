// src/agents/interfaces/agent.interface.ts

import type { AgentExecutor } from "langchain/agents";
import { AccountManager } from "../../lib/utils/account/AccountManager";
import { TransactionMonitor } from "../../lib/utils/monitoring/TransactionMonitor";
import { ContractInteractor } from "../../lib/utils/contract/ContractInteractor";
import { MantleAgentConfig } from "../../lib/agent/mantleAgent";

export interface MantleAgentInterface {
  readonly walletPrivateKey: string;
  readonly AgentExecutor: AgentExecutor;
  readonly anthropicApiKey: string;
  readonly accountManager: AccountManager;
  readonly transactionMonitor: TransactionMonitor;
  readonly contractInteractor: ContractInteractor;
  
  execute(input: string): Promise<unknown>;
  getCredentials(): {
    walletPrivateKey: string;
    anthropicApiKey: string;
  };
}

// This is the actual class implementation interface
export interface MantleAgentClass extends MantleAgentInterface {
  new (config: MantleAgentConfig): MantleAgentInterface;
  validateConfig(config: MantleAgentConfig): void;
}

// Keep the existing IAgent interface for backward compatibility
export interface IAgent {
  execute(input: string): Promise<unknown>;
  getCredentials(): {
    walletPrivateKey: string;
    anthropicApiKey: string;
  };
}
