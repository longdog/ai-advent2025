# AI Data Analysis Assistant

An interactive AI data analysis assistant powered by Groq LLM that helps users analyze and visualize data. The application provides analytical recommendations and stores reports in LogSeq.

## Features

- Interactive data analysis consultation using Groq LLM
- Multi-server MCP integration: supports both GitHub and LogSeq MCP servers
- Automated multi-step tool use (e.g., fetch from GitHub, then store in LogSeq)
- Report storage and management in LogSeq via MCP server
- Real-time data analysis, reporting, and visualization suggestions

## Prerequisites

- Bun runtime
- GROQ_API_KEY environment variable
- LogSeq running locally with API enabled
- LOGSEQ_API_TOKEN and LOGSEQ_API_URL environment variables
- GITHUB_API_TOKEN environment variable

## Installation

```bash
bun install
```

## Running the Application

```bash
bun run index.ts
```

## How it Works

1. The application runs an interactive console session where you can ask data analysis or GitHub/LogSeq-related questions.
2. The AI agent uses MCP protocol to call tools on both GitHub and LogSeq servers as needed, following a strict multi-step process (e.g., fetch from GitHub, process, then store in LogSeq).
3. The AI provides analysis, reports, and visualization advice, and can store results in LogSeq for future reference.

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one
