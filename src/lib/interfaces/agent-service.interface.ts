export interface AgentServiceInterface {
  getBalance(): Promise<string>;
  getAddress(): Promise<string>;
  sendTransaction(to: string, value: string): Promise<string>;
}