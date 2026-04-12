FROM node:20-bookworm-slim
ENV NODE_ENV=production
ENV BUILD_FRONTEND=false
WORKDIR /app
RUN apt-get update   && apt-get install -y --no-install-recommends     ca-certificates     fonts-liberation     libasound2     libatk-bridge2.0-0     libatk1.0-0     libcups2     libdrm2     libgbm1     libnss3     libnspr4     libx11-xcb1     libxcomposite1     libxdamage1     libxfixes3     libxkbcommon0     libxrandr2     libxshmfence1     libxss1     libpango-1.0-0     libpangocairo-1.0-0   && rm -rf /var/lib/apt/lists/*
# Copy backend package files
COPY backend/package*.json ./
RUN npm install --omit=dev
# Copy backend code
COPY backend/ ./
# Ensure theme files are copied (explicit copy for visibility)
COPY backend/themes/ ./themes/
EXPOSE 5000
CMD ["node", "server.js"]
