#!/bin/bash

# VDS Setup Script for Ödelink
# This script will configure the VDS with all necessary environment variables

set -e

VDS_IP="141.98.81.172"
VDS_USER="root"
VDS_PORT="22"

echo "🚀 Starting VDS setup for Ödelink..."

# Get secrets from GitHub
echo "📦 Fetching secrets from GitHub..."
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

echo "✅ Secrets fetched"

# Create .env content
ENV_CONTENT="# Server Configuration
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
"

echo "📝 Creating .env file on VDS..."

# SSH to VDS and setup
ssh -o StrictHostKeyChecking=no -p ${VDS_PORT} ${VDS_USER}@${VDS_IP} << 'ENDSSH'
set -e

echo "🔍 Checking if project exists..."
if [ ! -d ~/odelink-shop ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/odelinkshop/odelink-shop.git ~/odelink-shop
fi

cd ~/odelink-shop

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📝 Creating .env file..."
cat > backend/.env << 'ENDENV'
${ENV_CONTENT}
ENDENV

echo "📦 Installing backend dependencies..."
cd backend
npm install --production

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🏗️ Building frontend..."
npm run build

echo "🔧 Installing PM2 globally..."
npm install -g pm2

echo "🚀 Starting backend with PM2..."
cd ~/odelink-shop/backend
pm2 delete odelink-backend 2>/dev/null || true
pm2 start server.js --name odelink-backend --time

echo "💾 Saving PM2 configuration..."
pm2 save

echo "🔄 Setting up PM2 startup..."
pm2 startup systemd -u root --hp /root

echo "✅ VDS setup completed!"
echo "📊 PM2 status:"
pm2 status

echo "📋 Backend logs (last 20 lines):"
pm2 logs odelink-backend --lines 20 --nostream

ENDSSH

echo "✅ VDS setup completed successfully!"
echo ""
echo "🔗 Your site should be available at: https://www.odelink.shop"
echo "🔍 Check backend health: https://www.odelink.shop/api/health"
echo ""
echo "📊 To view logs, SSH to VDS and run: pm2 logs odelink-backend"
