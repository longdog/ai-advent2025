import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { GigaChat } from "langchain-gigachat";
import fs from "node:fs";
import { Agent } from "node:https";
import path from "node:path";
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

const systemPrompt1 = `
You are an AI code generator specialized in writing **unit tests** for TypeScript projects.

The user will provide the entire project source code, concatenated with headers like:
// FILE: relative/path/to/file.ts

### Rules:
1. **Understand Project Structure**
   - Use the // FILE headers to know where each file lives.
   - Always resolve imports correctly using the relative paths shown.
   - Do not invent new paths or files.
   - If a file has no exports, skip writing a test for it.

2. **Testing Framework**
   - Use Bun’s built-in test runner.
   - Import from "bun:test".
   - Example:
     import { test, expect } from "bun:test";

3. **Test Quality**
   - Cover each exported function, class, or constant with at least one meaningful test.
   - Use realistic inputs/outputs based on the implementation.
   - If a function uses async/await, test it accordingly.
   - If types suggest edge cases (like optional args or number boundaries), include those.

4. **Output Format**
   - Always return JSON in the following schema:
     {
       "tests": {
         "relative/path/to/file.test.ts": "FILE CONTENT",
         "another/path/to/file.test.ts": "FILE CONTENT"
       }
     }
   - Each key must be the test file path next to the source file.
   - Each value must be the full .test.ts file content, valid TypeScript.
   - Do not add explanations outside the JSON.

5. **Correctness**
   - The generated code must compile in TypeScript without modification.
   - Ensure imports match the original project structure.
   - Never use placeholders like TODO or pseudo code.

### Example:
If given:
// FILE: src/utils/math.ts
export function add(a: number, b: number) { return a + b; }

Your output must be:
{
  "tests": {
    "src/utils/math.test.ts": "import { test, expect } from 'bun:test';\\nimport { add } from './math';\\n\\ntest('add works', () => { expect(add(2, 3)).toBe(5); });"
  }
}
`;

const systemPrompt2 = `You are a validator for bun test results in a TypeScript project.
You will be given raw console output from running bun test.

Your task is to:

Detect if all tests passed or if any failed.

Report the number of tests run, how many passed, and how many failed.

If there are failures, extract the test names and show the error messages.

Output the result in this JSON format only:

{
  "status": "passed" | "failed",
  "summary": {
    "total": <number>,
    "passed": <number>,
    "failed": <number>
  },
  "failures": [
    {
      "test": "<test name>",
      "error": "<short error message>"
    }
  ]
}


Rules:

Always output valid JSON.

If no failures, "failures": [].

Never add explanations outside JSON.`;

// recursively scan directory
function scanFiles(dir: string, ext: string): string[] {
  let results: string[] = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!fullPath.includes("node_modules")) {
        results = results.concat(scanFiles(fullPath, ext));
      }
    } else if (file.endsWith(ext) && !file.endsWith(".test.ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function generateTests(context: string) {
  const messages = [
    new SystemMessage(systemPrompt1),
    new HumanMessage(context),
  ];
  const req = await groq.invoke(messages);
  return req.content.toString();
}

async function validateTests(context: string) {
  const messages = [
    new SystemMessage(systemPrompt2),
    new HumanMessage(context),
  ];
  const req = await groq.invoke(messages);
  return req.content.toString();
}
// create joined project context
function buildProjectContext(root: string, files: string[]): string {
  return files
    .map((f) => {
      const rel = path.relative(root, f);
      const code = fs.readFileSync(f, "utf-8");
      return `// FILE: ${rel}\n${code}`;
    })
    .join("\n\n");
}

async function main() {
  const projectDir = process.argv[2] || process.cwd();
  const tsFiles = scanFiles(projectDir, ".ts");

  const projectContext = buildProjectContext(projectDir, tsFiles);

  console.log("🤖 Sending project to Groq model...");
  const raw = await generateTests(projectContext);

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("❌ Failed to parse model output:", raw);
    process.exit(1);
  }

  if (!parsed.tests) {
    console.error("❌ No tests found in response.");
    process.exit(1);
  }

  for (const [relPath, code] of Object.entries(parsed.tests)) {
    const outPath = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, code as string, "utf-8");
    console.log(`✅ Created: ${relPath}`);
  }

  console.log("▶ Running Bun tests...");
  const proc = Bun.spawn(["bun", "test"], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  let output = "";
  for await (const chunk of proc.stdout) {
    output += Buffer.from(chunk).toString();
  }
  for await (const chunk of proc.stderr) {
    output += Buffer.from(chunk).toString("utf8");
  }
  await proc.exited;
  const validation = await validateTests(output.toString());

  console.log("🤖 Validate tests by Groq...");
  console.log(validation);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
