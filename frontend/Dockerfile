# Use Node 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the Next.js app
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the production server
CMD ["pnpm", "start"]