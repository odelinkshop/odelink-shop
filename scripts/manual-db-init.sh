#!/bin/bash
set -e

echo "🔧 Initializing database manually..."

cd ~/odelink-shop

docker run --rm \
  --network odelink-shop_default \
  -e DATABASE_URL="postgresql://postgres:odelink_production_password_change_me@postgres:5432/odelink_shop" \
  -v "$(pwd):/app" \
  -w /app \
  node:20-alpine \
  sh -c "cd backend && npm install --omit=dev && node ../scripts/init-database.js"

echo "✅ Database initialized successfully!"
