FROM node:20-alpine

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY server/src ./src

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]
