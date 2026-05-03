#!/bin/bash
# VPS'de .env dosyasını güncelle

cd /root/odelink-shop

# Git pull
git pull origin main

# Backend'i yeniden başlat
cd backend
pm2 restart odelink-backend

echo "✅ Güncelleme tamamlandı!"
pm2 logs odelink-backend --lines 20
