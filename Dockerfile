FROM node:20-alpine

WORKDIR /app

# Copy backend files only
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/src ./src

# Build TypeScript
RUN npm install typescript && npm run build

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "dist/index.js"]
