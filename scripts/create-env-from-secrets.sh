#!/bin/bash

# Create .env file from GitHub Secrets
# Run this script on VDS after cloning the repository

set -e

echo "🔐 Creating .env file from GitHub Secrets..."

# Fetch secrets from GitHub (requires gh CLI authenticated)
EMAIL_HOST=$(gh secret get EMAIL_HOST 2>/dev/null || echo "smtp.gmail.com")
EMAIL_PORT=$(gh secret get EMAIL_PORT 2>/dev/null || echo "587")
EMAIL_USER=$(gh secret get EMAIL_USER 2>/dev/null || echo "")
EMAIL_PASS=$(gh secret get EMAIL_PASS 2>/dev/null || echo "")
JWT_SECRET=$(gh secret get JWT_SECRET 2>/dev/null || echo "")
PASSWORD_RESET_SECRET=$(gh secret get PASSWORD_RESET_SECRET 2>/dev/null || echo "")
CLOUDFLARE_API_TOKEN=$(gh secret get CLOUDFLARE_API_TOKEN 2>/dev/null || echo "")
CLOUDFLARE_ZONE_ID=$(gh secret get CLOUDFLARE_ZONE_ID 2>/dev/null || echo "")
SHOPIER_API_TOKEN=$(gh secret get SHOPIER_API_TOKEN 2>/dev/null || echo "")
GOOGLE_CLIENT_ID=$(gh secret get GOOGLE_CLIENT_ID 2>/dev/null || echo "")

# Create .env file
cat > backend/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.odelink.shop

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=odelink_shop
DB_USER=postgres
DB_PASSWORD=odelink_secure_2026

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d
PASSWORD_RESET_SECRET=${PASSWORD_RESET_SECRET}

# Admin Email
ADMIN_CLAIM_EMAIL=odelink@admin.com

# Email Configuration
EMAIL_HOST=${EMAIL_HOST}
EMAIL_PORT=${EMAIL_PORT}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}

# Cloudflare API
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}

# Shopier API
SHOPIER_API_TOKEN=${SHOPIER_API_TOKEN}

# Google OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

# CORS
CORS_ORIGINS=https://www.odelink.shop,https://odelink.shop

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# Cloudinary
CLOUDINARY_CLOUD_NAME=demo

# Support Email
SUPPORT_EMAIL=odelinkdestek@gmail.com

# App Name
APP_NAME=Ödelink
EMAIL_FROM_NAME=Ödelink Destek

# Serve Frontend
SERVE_FRONTEND=true
AUTO_BUILD_FRONTEND=false
EOF

echo "✅ .env file created at backend/.env"
echo ""
echo "📋 Configuration summary:"
echo "  EMAIL_USER: ${EMAIL_USER}"
echo "  EMAIL_HOST: ${EMAIL_HOST}"
echo "  JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "  CLOUDFLARE_API_TOKEN: ${CLOUDFLARE_API_TOKEN:0:10}..."
echo "  SHOPIER_API_TOKEN: ${SHOPIER_API_TOKEN:0:10}..."
echo ""
echo "⚠️  Make sure to set DB_PASSWORD in .env if different from default"
