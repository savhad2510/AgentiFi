// src/lib/agent/MantleAgent.ts

import { RpcProvider } from "Mantle";
import { RPC_URL } from "../constant";
import { AccountManager } from "../utils/account/AccountManager";
import { TransactionMonitor } from "../utils/monitoring/TransactionMonitor";
import { ContractInteractor } from "../utils/contract/ContractInteractor";
import { MantleAgentInterface } from "../../agents/interfaces/agent.interface";
import { AgentExecutor } from "langchain/agents";
import { createAgent } from "./agent";

export const rpcProvider = new RpcProvider({ nodeUrl: RPC_URL });

export interface MantleAgentConfig {
  walletPrivateKey: string;
  anthropicApiKey: string;
}

export class MantleAgent implements MantleAgentInterface {
  public readonly walletPrivateKey: string;
  public readonly anthropicApiKey: string;
  public readonly AgentExecutor: AgentExecutor;
  public readonly accountManager: AccountManager;
  public readonly transactionMonitor: TransactionMonitor;
  public readonly contractInteractor: ContractInteractor;

  constructor(config: MantleAgentConfig) {
    this.validateConfig(config);
    
    this.walletPrivateKey = config.walletPrivateKey;
    this.anthropicApiKey = config.anthropicApiKey;
    
    // Initialize utility classes
    this.accountManager = new AccountManager(rpcProvider);
    this.transactionMonitor = new TransactionMonitor(rpcProvider);
    this.contractInteractor = new ContractInteractor(rpcProvider);
    
    // Initialize agent executor
    this.AgentExecutor = createAgent(this as MantleAgentInterface, this.anthropicApiKey);
  }

  private validateConfig(config: MantleAgentConfig) {
    if (!config.walletPrivateKey) {
      throw new Error(
        "Mantle wallet private key is required https://www.argent.xyz/argent-x",
      );
    }
    if (!config.anthropicApiKey) {
      throw new Error("Anthropic API key is required");
    }
  }

  getCredentials() {
    return {
      walletPrivateKey: this.walletPrivateKey,
      anthropicApiKey: this.anthropicApiKey,
    };
  }

  async execute(input: string): Promise<unknown> {
    const response = await this.AgentExecutor.invoke({
      input,
    });
    return response;
  }
}