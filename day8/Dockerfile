# Stage 1: Build the Node.js application
FROM oven/bun:1 as node_builder

WORKDIR /usr/src/app

COPY package.json bun.lock* tsconfig.json index.ts ./
RUN bun install --frozen-lockfile

# Stage 2: Build the Python application
FROM python:3.12-slim as python_builder

WORKDIR /usr/src/app

COPY mcp-gsheet/ ./mcp-gsheet/
RUN pip install --no-cache-dir -r mcp-gsheet/requirements.txt

# Final Stage: Create the final image
FROM oven/bun:1

WORKDIR /usr/src/app

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Copy the built Node.js application
COPY --from=node_builder /usr/src/app/ .

# Copy the built Python application
COPY --from=python_builder /usr/src/app/ .

# Create a start script
COPY start.sh .
RUN chmod +x start.sh

# Expose ports (if necessary)
# EXPOSE 3000
# EXPOSE 8000

# Set environment variables from .env file
COPY .env .
COPY gcp-oauth.json .
# RUN export $(cat .env | xargs)

CMD ["./start.sh"]
