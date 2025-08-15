import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const initStdioClient = async () => {
  const stdioClient = new Client({
    name: "logseq",
    version: "1",
  });
  const { LOGSEQ_API_TOKEN, LOGSEQ_API_URL } = process.env;
  const transport = new StdioClientTransport({
    command: "mcp-logseq",
    env: { LOGSEQ_API_TOKEN, LOGSEQ_API_URL },
  });
  await stdioClient.connect(transport);
  return stdioClient;
};
const stdioClient = await initStdioClient();
const tools = await loadMcpTools("logseq-mcp-server", stdioClient);

const groq = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});
const agent = createReactAgent({
  llm: groq,
  tools,
});
const bold = (s: string) => console.log(`\x1b[1m${s}\x1b[0m`);
const italic = (s: string) => console.log(`\x1b[3m${s}\x1b[0m`);

const systemPrompt1 = `Ты - профессиональный шеф-повар, даешь советы по приготовлению блюд и можешь предложить рецепты. Ты можешь использовать инструменты, чтобы помочь пользователю найти рецепты, ингредиенты и советы по кулинарии.`;

bold(
  "Привет! Я профессиональный шеф-повар, могу помочь вам с рецептами и советами по кулинарии!"
);
process.stdout.write("> ");
for await (const user of console) {
  const messages = [new SystemMessage(systemPrompt1), new HumanMessage(user)];

  const reqGroq = await agent.invoke({ messages });
  italic(
    reqGroq?.messages?.slice?.(-1)?.[0]?.content.toString() || "Нет ответа"
  );
  process.exit(0);
}
