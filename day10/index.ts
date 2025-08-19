import { HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import {
  MultiServerMCPClient,
  type ClientConfig,
} from "@langchain/mcp-adapters";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

const mcpConfig: ClientConfig = {
  throwOnLoadError: true,
  // prefixToolNameWithServerName: true,
  // additionalToolNamePrefix: "mcp",

  mcpServers: {
    tmux: {
      transport: "stdio" as const,
      command: "node",
      args: ["tmux-mcp/build/index.js", "--shell-type=fish"],
    },
  },
};
const client = new MultiServerMCPClient(mcpConfig);
const tools = await client.getTools();

const groq = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are a careful assistant using MCP server.`],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);
const agent = createToolCallingAgent({
  llm: groq,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

marked.use(markedTerminal());

console.log("Что изволите? ");
process.stdout.write("> ");
for await (const user of console) {
  const messages = [new HumanMessage(user)];

  const reqGroq = await agentExecutor.invoke({ input: user });
  console.log(reqGroq);
  process.exit(0);
}
