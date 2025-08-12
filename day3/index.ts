const AI_URL = `https://api.groq.com/openai/v1/chat/completions` as const;

const { AI_AUTH_KEY } = process.env;

const system = `Ты - генератор поздравлений.
В диалоге с пользователем задавай наводящие вопросы, чтобы получить информацию о человеке, которому нужно составить поздравление:
- Имя
- С чем поздравляем
- Пол (можешь определить по имени, но если не уверен, спроси)
- Стиль поздравления (формальный, неформальный, юмор, стихотворный и т.д.)
- Дополнительные пожелания
Спрашивай по очереди, не задавай все вопросы сразу, чтобы пользователь мог ответить на каждый из них.
Не повторяй вопросы, если пользователь уже ответил на них.
После получения всей информации, сгенерируй поздравление в виде текста, который можно использовать в открытке или сообщении.
Выводи только текст поздравления, без дополнительных комментариев или инструкций.
В начале поздравления должно стоять слово НАЧАЛО, а в конце - КОНЕЦ.
Пример диалога:
Ты: Кого мы поздравляем?
Пользователь: Поздравляем тетю Глашу.
Ты: С чем мы поздравляем тетю Глашу?
Пользователь: С днем рождения.
Ты: Какой стиль поздравления предпочитает тетя Глаша? Формальный, неформальный, с юмором или стихотворный?
Пользователь: Она любит юмор.
Ты: Отлично! Есть ли какие-то особые пожелания или темы, которые ты хочешь включить в поздравление?
Пользователь: Нет.
Ты: НАЧАЛО
Дорогая тетя Глаша!
Поздравляем тебя с днем рождения! Желаем тебе цвести и пахнуть!
КОНЕЦ
`;

const hi = "> ";
type Role = "system" | "user" | "assistant";
type Prompt = {
  role: Role;
  content: string;
};
export async function groq(): Promise<(messages: Prompt[]) => Promise<string>> {
  return async (messages: Prompt[]) => {
    const data = {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages,
    };
    try {
      const promptReq = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${AI_AUTH_KEY}`,
        },
        body: JSON.stringify(data),
      });
      const result = await promptReq.json();
      return (result?.choices?.[0]?.message?.content || "") as string;
    } catch (error) {
      console.log(error);
      throw new Error("Groq send data error");
    }
  };
}

const ask = await groq();
console.log("Добро пожаловать в генератор поздравлений!");
const messages: Prompt[] = [
  {
    role: "system",
    content: system,
  },
];
const req = await ask(messages);
process.stdout.write(req);
messages.push({
  role: "assistant",
  content: req,
});
process.stdout.write("\n\n");
process.stdout.write(hi);
for await (const user of console) {
  messages.push({
    role: "user",
    content: user,
  });
  const req = await ask(messages);

  if (req.includes("НАЧАЛО")) {
    console.log("Ваше поздравление:");
    process.stdout.write(req.replace("НАЧАЛО", "").replace("КОНЕЦ", ""));
    process.exit(0);
  }
  messages.push({
    role: "assistant",
    content: req,
  });
  process.stdout.write(req);
  process.stdout.write("\n\n");
  process.stdout.write(hi);
}
