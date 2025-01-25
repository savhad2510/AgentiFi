// src/lib/agent/agent.ts
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatAnthropic } from "@langchain/anthropic";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { createTools } from "./tools.js";
import { MantleAgentInterface } from "../../agents/interfaces/agent.interface";

// Store chat history
let chatHistory: (HumanMessage | AIMessage)[] = [];

const systemMessage = new SystemMessage(`
  You are a helpful Mantle AI assistant with autonomous analysis capabilities and memory of our conversation. You can:
  1. Remember our previous interactions and context
  2. Analyze wallet states and balances
  3. Identify opportunities based on available assets
  4. Make recommendations for optimal asset utilization
  5. Execute suggested actions upon user approval
  
  When asked about possibilities or opportunities:
  1. First analyze the wallet state using analyze_wallet_opportunities
  2. Present findings in a clear, structured way
  3. Explain the risks and potential benefits of each opportunity
  4. Offer to execute any of the suggested actions upon user confirmation
  
 
  Guidelines:
  - Keep technical explanations under 2-3 lines
  - Use bullet points for clarity
  - Focus on actionable next steps
  - No lengthy apologies or explanations
  - Maintain context from previous interactions
`);

export const prompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  ...chatHistory,
  ["user", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

export const createAgent = (agent: MantleAgentInterface, anthropicApiKey: string) => {
  const model = new ChatAnthropic({
    modelName: "claude-3-5-sonnet-latest",
    anthropicApiKey: anthropicApiKey,
  });

  const tools = createTools(agent);

  const toolAgent = createToolCallingAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent: toolAgent,
    tools,
  });

  // Wrap the execute method to maintain chat history
  const originalExecute = agentExecutor.invoke.bind(agentExecutor);
  agentExecutor.invoke = async (input: any) => {
    const result = await originalExecute(input);
    
    // Add the exchange to chat history
    chatHistory.push(new HumanMessage(input.input));
    chatHistory.push(new AIMessage(result.output));
    
    // Limit history to last 10 exchanges to prevent context overflow
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }
    
    return result;
  };

  return agentExecutor;
};