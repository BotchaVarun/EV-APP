FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Expose the MCP Remote Server port
EXPOSE 3001

# Default environment variables (should be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3001

# Command to accept arguments; defaults to running the remote server
CMD ["npx", "tsx", "mcp-server/remote.ts"]
