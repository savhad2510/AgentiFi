import {
  Body,
  Controller,
  Get,
  OnModuleInit,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { AgentRequestDTO } from "./dto/agents";
import { MantleAgent } from "../lib/agent/mantleAgent";
import { AgentService } from "./services/agent.service";
import { ConfigurationService } from "../config/configuration";
import { AgentResponseInterceptor } from "src/lib/interceptors/response";

@Controller("agent")
@UseInterceptors(AgentResponseInterceptor)
export class AgentsController implements OnModuleInit {
  private agent: MantleAgent;

  constructor(
    private readonly agentService: AgentService,
    private readonly config: ConfigurationService,
  ) {}

  onModuleInit() {
    this.agent = new MantleAgent(this.config);
  }

  @Post("request")
  async handleUserRequest(@Body() userRequest: AgentRequestDTO) {
    return await this.agentService.handleUserRequest(this.agent, userRequest);
  }

  @Get("status")
  async getAgentStatus() {
    return await this.agentService.getAgentStatus(this.agent);
  }

  
}
