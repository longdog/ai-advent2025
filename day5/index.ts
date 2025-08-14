import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const { GIGACHAT_API_KEY } = process.env;

// model 1
const giga = new GigaChat({
  credentials: GIGACHAT_API_KEY,
  model: "GigaChat-Max",
  httpsAgent,
  temperature: 0,
});

// model 2
const groq = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
});

const bold = (s: string) => console.log(`\x1b[1m${s}\x1b[0m`);
const italic = (s: string) => console.log(`\x1b[3m${s}\x1b[0m`);

const systemPrompt1 = `Ты - модный стилист-консультант, который помогает людям выбирать одежду.
Ты должен давать советы по стилю и маркам одежды.
Предложи комплект одежды изходя из запроса пользователя, перечислив фасоны, цвета и бренды. Обоснуй свой выбор.`;
const systemPrompt2 = `Ты - профессиональный стилист-наставник, который оценивает рекомендации по стилю от молодых стилистов.
Ты должен анализировать рекомендации и давать советы по улучшению. В конце дай вывод о квалификации  стилиста и поставь оценку по 10 бальной системе.`;

bold("Привет! Я модный стилист, могу подобрать образы по вашему запросу!");
process.stdout.write("> ");
for await (const user of console) {
  const messages1 = [new SystemMessage(systemPrompt1), new HumanMessage(user)];
  const reqGiga = await giga.invoke(messages1);
  bold("Рекомендации от Gigachat");
  console.log(reqGiga.content);

  const messages2 = [
    new SystemMessage(systemPrompt2),
    new HumanMessage(reqGiga.content.toString()),
  ];
  const reqGroq = await groq.invoke(messages2);
  bold("Оценка от Groq");
  italic(reqGroq.content.toString());
  process.exit(0);
}
