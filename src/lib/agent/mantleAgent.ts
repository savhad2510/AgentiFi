import { ethers } from "ethers";
import type { AgentExecutor } from "langchain/agents";
import { AccountManager } from "../../lib/utils/account/AccountManager";
import { TransactionMonitor } from "../../lib/utils/monitoring/TransactionMonitor";
import { ContractInteractor } from "../../lib/utils/contract/ContractInteractor";

export interface MantleAgentConfig {
  mantle: {
    rpcUrl: string;
    privateKey: string;
  };
  anthropic: {
    apiKey: string;
  };
}

import { MantleRPCProvider } from "./mantleRPCProvider";
import { ConfigurationService } from "../../config/configuration";
import { AgentServiceInterface } from "../interfaces/agent-service.interface";
import { MantleAgentInterface } from "../../agents/interfaces/agent.interface";

export class MantleAgent implements AgentServiceInterface, MantleAgentInterface {
  readonly walletPrivateKey: string;
  readonly AgentExecutor: AgentExecutor;
  readonly anthropicApiKey: string;
  readonly accountManager: AccountManager;
  readonly transactionMonitor: TransactionMonitor;
  readonly contractInteractor: ContractInteractor;
  private provider: MantleRPCProvider;
  private wallet: ethers.Wallet;
  private config: ConfigurationService;
  
  constructor(config: ConfigurationService) {
    this.config = config;
    this.walletPrivateKey = config.mantle.privateKey;
    this.anthropicApiKey = config.anthropic.apiKey;
    // Initialize Mantle provider first
    this.provider = new MantleRPCProvider(config.mantle.rpcUrl);
    
    // Initialize wallet with private key
    this.wallet = new ethers.Wallet(
      config.mantle.privateKey,
      this.provider
    );

    // Initialize managers with provider
    this.accountManager = new AccountManager(this.provider);
    this.transactionMonitor = new TransactionMonitor(this.provider);
    this.contractInteractor = new ContractInteractor(this.provider);
    // TODO: Initialize AgentExecutor
  }

  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  async getAddress(): Promise<string> {
    return this.wallet.address;
  }

  async sendTransaction(to: string, value: string): Promise<string> {
    const tx = await this.wallet.sendTransaction({
      to,
      value: ethers.parseEther(value)
    });
    return tx.hash;
  }

  async execute(input: string): Promise<unknown> {
    const [command, ...args] = input.split(' ');
    const parsedArgs = args.reduce((acc, arg) => {
      const [key, value] = arg.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    switch (command) {
      case 'getBalance':
        return this.getBalance();
      case 'sendTransaction':
        return this.sendTransaction(parsedArgs.to, parsedArgs.value);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  getCredentials(): { walletPrivateKey: string; anthropicApiKey: string } {
    return {
      walletPrivateKey: this.config.mantle.privateKey,
      anthropicApiKey: this.config.anthropic.apiKey
    };
  }
}
