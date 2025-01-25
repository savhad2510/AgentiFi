import { ethers } from "ethers";

export class MantleRPCProvider extends ethers.JsonRpcProvider {
  constructor(rpcUrl: string) {
    super(rpcUrl);
  }

  // Get block number
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  // Get chain ID
  async getChainId(): Promise<number> {
    const chainId = await this.provider.getNetwork().then(network => network.chainId);
    return Number(chainId);
  }

  // Get block with transactions
  async getBlockWithTxs(blockNumber: number) {
    return await this.provider.getBlock(blockNumber, true);
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.getTransactionReceipt(txHash);
  }

  // Get transaction by hash
  async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> {
    return await this.provider.getTransaction(txHash);
  }

  // Get balance of address
  async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }

  // Get storage at address
  async getStorageAt(address: string, position: string): Promise<string> {
    return await this.provider.getStorage(address, position);
  }

  // Get code at address
  async getCode(address: string): Promise<string> {
    return await this.provider.getCode(address);
  }

  // Get transaction count for address
  async getTransactionCount(address: string): Promise<number> {
    return await this.provider.getTransactionCount(address);
  }

  // Get gas price
  async getGasPrice() {
    return await this.provider.getFeeData();
  }
}