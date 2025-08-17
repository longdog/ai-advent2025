import { SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

import { Bot } from "grammy";
import cron from "node-cron";

const { BOT_TOKEN } = process.env;

const initStdioClient = async () => {
  const stdioClient = new Client({
    name: "mcp-gsheet",
    version: "1",
  });
  const transport = new StdioClientTransport({
    command: "python3",
    args: ["./mcp-gsheet/server.py"],
    env: { GOOGLE_APPLICATION_CREDENTIALS: "/usr/src/app/gcp-oauth.json" },
  });
  await stdioClient.connect(transport);
  return stdioClient;
};
const stdioClient = await initStdioClient();
const tools = await loadMcpTools("mcp-gsheet", stdioClient);

const groq = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});
const agent = createReactAgent({
  llm: groq,
  tools,
});
marked.use(markedTerminal());
const systemPrompt1 = `
Ты - профессиональный аналитик данных, специализирующийся на анализе google таблиц. Будь кратким и ясным в своих ответах.
Проанализируй данные google таблицы 1-XYT5bcmFqq0R2BYKFqG5uYCfUdh_ZtnbmD2rxS6iMA
Составь отчет по выбыванию участников: день / количество и опиши тренд. 
Также составь отчет по использованию сервисов участниками (github, yandex диск и т.д.) Сервис: сколько участников использует.
Отчет возвращай в формате, пригодном для отображения в Telegram.`;

const messages = [new SystemMessage(systemPrompt1)];

const getResult = async () => {
  const reqGroq = await agent.invoke({ messages });
  const result =
    reqGroq?.messages?.slice?.(-1)?.[0]?.content.toString() || "Нет ответа";
  return result;
};

// Create a new bot instance
const bot = new Bot(BOT_TOKEN!);

// Use a Set to store the chat IDs of the subscribers
const subscribers = new Set<number>();

// Handle the /start command
bot.command("start", (ctx) => {
  const chatId = ctx.chat.id;
  if (!subscribers.has(chatId)) {
    subscribers.add(chatId);
    console.log(`New subscriber: ${chatId}`);
    ctx.reply("Бот аналитики AI Challenge запущен!");
  } else {
    ctx.reply("Вы уже подписаны на бота аналитики AI Challenge.");
  }
});

// Handle the /stop command
bot.command("stop", (ctx) => {
  const chatId = ctx.chat.id;
  if (subscribers.has(chatId)) {
    subscribers.delete(chatId);
    console.log(`Subscriber removed: ${chatId}`);
    ctx.reply("Вы отписались от бота аналитики AI Challenge.");
  } else {
    ctx.reply("Вы не подписаны на бота аналитики AI Challenge.");
  }
});

// Schedule the daily message
// Runs every day at 10:00 AM
cron.schedule("* * * * *", async () => {
  console.log("Sending daily message to all subscribers...");
  for (const chatId of subscribers) {
    const result = await getResult();
    bot.api.sendMessage(chatId, result).catch((err) => {
      console.error(`Failed to send message to ${chatId}:`, err);
      // If the bot is blocked by the user, remove them from the subscribers list
      if (err.description === "Forbidden: bot was blocked by the user") {
        subscribers.delete(chatId);
        console.log(
          `Subscriber removed because they blocked the bot: ${chatId}`
        );
      }
    });
  }
});

// Start the bot
bot.start();

console.log("Bot started!");
