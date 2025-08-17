FROM oven/bun:1

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* tsconfig.json index.ts ./
RUN bun install --frozen-lockfile

COPY mcp-gsheet/ ./mcp-gsheet/
RUN cd mcp-gsheet && python3 -m pip install --break-system-packages .

COPY .env .
RUN export $(cat .env | xargs)

COPY gcp-oauth.json .

CMD ["bun","run", "index.ts"]
