FROM node:20-alpine

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY server/src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]
