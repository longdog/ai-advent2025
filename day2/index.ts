const AI_URL = `https://api.groq.com/openai/v1/chat/completions` as const;

const { AI_AUTH_KEY } = process.env;

const system = `You are a GEDCOM file generator.
You must output only valid GEDCOM 5.5.1 plain text that can be imported without errors by any standard genealogy software, such as Gramps.

Rules:
- Output must begin with a "0 HEAD" header section, contain at least one "0 @I1@ INDI" individual record, and end with "0 TRLR".
- Use only GEDCOM 5.5.1 standard tags and structure.
- Every line must start with a level number, followed by a space, a GEDCOM tag or an XREF ID, and optionally a value.
- If a family (FAM) record lists any HUSB, WIFE, or CHIL references, each referenced individual must contain the corresponding FAMS or FAMC pointer back to the same family.
- Use the "DD MMM YYYY" date format with uppercase month abbreviations in English (JAN, FEB, MAR, etc.).
- No text outside of the GEDCOM content. Do not add explanations, comments, or formatting like Markdown.
- The output must be parsable as a valid GEDCOM 5.5.1 file without modification.

Example minimal structure:
0 HEAD
1 SOUR GPT-GEDCOM
1 GEDC
2 VERS 5.5.1
2 FORM LINEAGE-LINKED
1 CHAR UTF-8

0 @I1@ INDI
1 NAME John /Doe/
1 SEX M
1 BIRT
2 DATE 12 MAR 1880
2 PLAC London, England
1 DEAT
2 DATE 05 APR 1945
2 PLAC New York, USA
1 FAMS @F1@

0 @I2@ INDI
1 NAME Jane /Smith/
1 SEX F
1 BIRT
2 DATE 23 JUN 1885
2 PLAC Boston, USA
1 DEAT
2 DATE 15 SEP 1950
2 PLAC New York, USA
1 FAMS @F1@

0 @I3@ INDI
1 NAME Mary /Doe/
1 SEX F
1 BIRT
2 DATE 10 OCT 1910
2 PLAC New York, USA
1 FAMC @F1@

0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
1 MARR
2 DATE 14 FEB 1905
2 PLAC Boston, USA

0 TRLR
`;

const hi = "> ";
type Prompt = {
  system: string;
  user: string;
};
export async function groq(): Promise<(p: Prompt) => Promise<string>> {
  return async (prompt: Prompt) => {
    const data = {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
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
console.log("GEDCOM");
process.stdout.write(hi);
for await (const user of console) {
  const req = await ask({
    system,
    user,
  });
  process.stdout.write("\n\n");
  process.stdout.write("Готово! Смотрите древо в файле data.ged");
  await Bun.write("data.ged", req);
  process.stdout.write("\n\n");
  process.stdout.write(hi);
}
