import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
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
marked.use(markedTerminal());
const systemPrompt1 = `Ты - профессиональный аналитик данных, специализирующийся на анализе и визуализации данных. 
Ты можешь использовать инструменты для выполнения сложных запросов и анализа данных. 
Твоя задача - помочь пользователю с вопросами по анализу данных, предоставляя точные и полезные ответы. Будь кратким и ясным в своих ответах.
Отчет возвращай в виде текстов и таблиц в формате Markdown.
`;

console.log("Привет! Я аналитик данных. Что ты хочешь проанализировать? ");
process.stdout.write("> ");
for await (const user of console) {
  const messages = [new SystemMessage(systemPrompt1), new HumanMessage(user)];

  const reqGroq = await agent.invoke({ messages });
  console.log(
    marked(
      reqGroq?.messages?.slice?.(-1)?.[0]?.content.toString() || "Нет ответа"
    )
  );
  process.exit(0);
}
