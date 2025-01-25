import { AgentRequestDTO } from "../dto/agents";
import { IAgent } from "./agent.interface";

export interface AgentExecutionResponse {
  status: "success" | "failure";
  data?: unknown;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface IAgentService {
  handleUserRequest(
    agent: IAgent,
    userRequest: AgentRequestDTO,
  ): Promise<AgentExecutionResponse>;
  getAgentStatus(agent: IAgent): Promise<{
    isReady: boolean;
    walletConnected: boolean;
    apiKeyValid: boolean;
  }>;
}
