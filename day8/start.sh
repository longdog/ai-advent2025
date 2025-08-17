#!/bin/bash

# Start the Python server in the background
python3 mcp-gsheet/server.py &

# Start the Node.js application
bun run index.ts
