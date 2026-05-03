# STAGE 1: Build Frontend
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# STAGE 2: Final Image
FROM node:20-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app

# Install dependencies for Puppeteer/Shopier scraper
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libnspr4 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxshmfence1 \
    libxss1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

# Copy BUILT frontend from Stage 1 to the location served by backend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "server.js"]
