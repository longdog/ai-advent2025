import { HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  MultiServerMCPClient,
  type ClientConfig,
} from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
const { LOGSEQ_API_TOKEN, LOGSEQ_API_URL } = process.env;
const { GITHUB_API_TOKEN } = process.env;
const initLogseqClient = async () => {
  const stdioClient = new Client({
    name: "logseq",
    version: "1",
  });
  const transport = new StdioClientTransport({
    command: "mcp-logseq",
    env: { LOGSEQ_API_TOKEN, LOGSEQ_API_URL },
  });
  await stdioClient.connect(transport);
  return stdioClient;
};
const initGithubClient = async () => {
  const githubClient = new Client({
    name: "github",
    version: "1",
  });
  const transport = new StreamableHTTPClientTransport(
    new URL("https://api.githubcopilot.com/mcp/"),
    {
      requestInit: {
        headers: {
          Authorization: `Bearer ${GITHUB_API_TOKEN}`,
        },
      },
    }
  );

  await githubClient.connect(transport);
  return githubClient;
};
// const logseqClient = await initLogseqClient();
// const githubClient = await initGithubClient();
// const tools1 = await loadMcpTools("logseq-mcp-server", logseqClient);
// const tools2 = await loadMcpTools("github-mcp-server", githubClient);

const mcpConfig: ClientConfig = {
  throwOnLoadError: true,
  // prefixToolNameWithServerName: true,
  // additionalToolNamePrefix: "mcp",

  mcpServers: {
    logseq: {
      transport: "stdio" as const,
      command: "mcp-logseq",
      env: { LOGSEQ_API_TOKEN, LOGSEQ_API_URL },
      args: [],
    },
    github: {
      transport: "http" as const,
      url: "https://api.githubcopilot.com/mcp/",
      headers: {
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
      },
    },
  },
};
const client = new MultiServerMCPClient(mcpConfig);
const tools = await client.getTools();

const groq = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});
const agent1 = createReactAgent({
  llm: groq,
  tools: tools,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a careful assistant using multiple MCP servers (GitHub, Logseq).
Follow this strict process:

1. If a task requires data from GitHub, FIRST call the GitHub tool. 
   - Wait for its response.

2. Only AFTER receiving GitHub data, analyze it.
   - Transform or summarize the result in natural language.

3. Then, and only then, call the Logseq tool with the processed data.
   - Do not call Logseq before GitHub data is available.

NEVER combine tool calls in one step.
ALWAYS wait for the result of the previous tool call before proceeding`,
  ],
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
const systemPrompt1 = `You are an AI agent designed to interact reliably with MCP servers.
Always adhere strictly to the required data schema of the target MCP server.
`;

console.log("Что изволите? ");
process.stdout.write("> ");
for await (const user of console) {
  const messages = [new HumanMessage(user)];

  const reqGroq = await agentExecutor.invoke({ input: user });
  console.log(reqGroq);

  // console.log(
  //   marked(
  //     reqGroq?.messages?.slice?.(-1)?.[0]?.content.toString() || "Нет ответа"
  //   )
  // );
  process.exit(0);
}
// get my GitHub Account info and save it as a page in Logseq
