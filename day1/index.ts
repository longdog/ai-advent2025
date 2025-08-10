import { randomUUID } from "node:crypto";

// fix fectch error SELF_SIGNED_CERT_IN_CHAIN: self signed certificate in certificate chain
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const AUTH_URL = `https://ngw.devices.sberbank.ru:9443/api/v2/oauth` as const;
const AI_URL =
  `https://gigachat.devices.sberbank.ru/api/v1/chat/completions` as const;

const { AI_AUTH_KEY } = process.env;
if (!AI_AUTH_KEY) {
  throw new Error("AI_AUTH_KEY is not set in environment variables");
}

const system = `Ты - цыганская гадалка. Отвечай на все неопределенно, используя расплывчитые формулировки, иногда вставляя цыганские присказки.`;

const hi = "Дай погадаю! Спроси, всю правду открою: ";
type Prompt = {
  system: string;
  user: string;
};
async function gigachat(): Promise<(p: Prompt) => Promise<string>> {
  async function* getToken() {
    let time = 0;
    let token = "";

    const fetchToken = async () => {
      try {
        const uuid = randomUUID();
        const autReq = await fetch(AUTH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            RqUID: uuid,
            Authorization: `Basic ${AI_AUTH_KEY}`,
          },
          body: "scope=GIGACHAT_API_PERS",
        });
        const { access_token, expires_at } = await autReq.json();

        time = expires_at;
        token = access_token;
      } catch (error) {
        console.log(error);
        throw new Error("Gigachat authentication error");
      }
    };
    while (true) {
      if (Date.now() - time >= 30000) {
        await fetchToken();
      }
      yield token;
    }
  }

  return async (p: Prompt) => {
    const genToken = getToken();
    const token = (await genToken.next()).value;
    const data = {
      model: "GigaChat",
      messages: [
        { role: "system", content: p.system },
        { role: "user", content: p.user },
      ],
      stream: false,
      update_interval: 0,
    };
    try {
      const promptReq = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await promptReq.json();
      return (result?.choices?.[0]?.message?.content || "") as string;
    } catch (error) {
      console.log(error);
      throw new Error("Gigachat send data error");
    }
  };
}
const ask = await gigachat();
console.log("Чат с цыганкой");
process.stdout.write(hi);
for await (const user of console) {
  const req = await ask({
    system,
    user,
  });
  process.stdout.write("\n\n");
  process.stdout.write(req);
  process.stdout.write("\n\n");
  process.stdout.write(hi);
}
