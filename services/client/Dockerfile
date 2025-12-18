# syntax=docker/dockerfile:1
FROM oven/bun:1

WORKDIR /app

# Copy dependency files
COPY services/client/package.json services/client/bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY services/client/ .

# Expose Vite dev port
EXPOSE 5173

# Run dev server with host binding
CMD ["bun", "run", "dev", "--host"]
