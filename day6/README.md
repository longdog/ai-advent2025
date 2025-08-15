# AI Cooking Assistant

An interactive AI cooking assistant powered by Groq LLM that helps users with recipes and cooking advice. The application provides culinary recommendations and stores recipes in LogSeq.

## Features

- Interactive cooking consultation using Groq LLM
- Recipe storage and management in LogSeq
- Real-time cooking advice and recipe suggestions

## Prerequisites

- Bun runtime
- GROQ_API_KEY environment variable
- LogSeq running locally with API enabled
- LOGSEQ_API_TOKEN and LOGSEQ_API_URL environment variables

## Installation

```bash
bun install
```

## Running the Application

```bash
bun run index.ts
```

## How it Works

1. The application runs an interactive console session where you can ask cooking questions
2. The AI chef provides recipe suggestions and cooking advice
3. Recipes and notes can be stored in LogSeq for future reference

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
