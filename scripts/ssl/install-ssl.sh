#!/bin/bash

# Wildcard SSL Kurulum Script
# Let's Encrypt ile wildcard sertifika

set -e

echo "🔐 Wildcard SSL Kurulumu Başlıyor..."

# Certbot kur
echo "📦 Certbot kuruluyor..."
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Wildcard sertifika iste (DNS challenge)
echo "🔑 Wildcard SSL sertifikası isteniyor..."
echo ""
echo "⚠️  DİKKAT: Cloudflare'de TXT kaydı eklemeniz gerekecek!"
echo ""

sudo certbot certonly --manual \
  --preferred-challenges dns \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos \
  --email muratbyrm3752@gmail.com \
  -d odelink.shop \
  -d *.odelink.shop

echo ""
echo "✅ SSL sertifikası alındı!"
echo ""

# Nginx SSL config güncelle
echo "📝 Nginx SSL config güncelleniyor..."

# Nginx config dosyasını güncelle
sudo tee /etc/nginx/sites-available/odelink > /dev/null <<'EOF'
# Odelink Nginx Configuration with SSL
# Wildcard subdomain support for user sites

# Redirect HTTP to HTTPS (apex domain)
server {
    listen 80;
    listen [::]:80;
    server_name odelink.shop;
    
    return 301 https://www.odelink.shop$request_uri;
}

# Redirect HTTP to HTTPS (www)
server {
    listen 80;
    listen [::]:80;
    server_name www.odelink.shop;
    
    return 301 https://www.odelink.shop$request_uri;
}

# Main site HTTPS (www.odelink.shop)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.odelink.shop;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/odelink.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/odelink.shop/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Frontend static files
    root /home/odelink/odelink-shop/frontend/build;
    index index.html;
    
    # API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS (wildcard subdomain)
server {
    listen 80;
    listen [::]:80;
    server_name ~^(?<subdomain>[^.]+)\.odelink\.shop$;
    
    # Exclude www from wildcard
    if ($subdomain = "www") {
        return 404;
    }
    
    return 301 https://$host$request_uri;
}

# Wildcard subdomain HTTPS (*.odelink.shop)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ~^(?<subdomain>[^.]+)\.odelink\.shop$;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/odelink.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/odelink.shop/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Exclude www from wildcard
    if ($subdomain = "www") {
        return 404;
    }
    
    # All requests to backend (backend serves theme)
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Subdomain $subdomain;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "✅ Nginx config güncellendi!"

# Nginx test ve reload
echo "🔄 Nginx test ediliyor..."
sudo nginx -t

echo "🔄 Nginx reload ediliyor..."
sudo systemctl reload nginx

echo ""
echo "✅ SSL KURULUMU TAMAMLANDI!"
echo ""
echo "🎉 Artık tüm subdomain'ler HTTPS ile çalışıyor!"
echo ""
echo "Test et:"
echo "  https://www.odelink.shop"
echo "  https://kriyataki.odelink.shop"
echo ""
