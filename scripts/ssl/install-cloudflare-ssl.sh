#!/bin/bash

# Cloudflare Origin Certificate Kurulum Script
# NO SUDO REQUIRED - Prepares SSL files for manual nginx config update

set -e

echo "🔐 Cloudflare Origin SSL Kurulumu Başlıyor..."

# SSL dizini oluştur (user home directory)
SSL_DIR="$HOME/.ssl/cloudflare"
echo "📁 SSL dizini oluşturuluyor: $SSL_DIR"
mkdir -p "$SSL_DIR"

# Sertifikaları kopyala
echo "📋 Sertifikalar kopyalanıyor..."
cp ssl/odelink.shop.pem "$SSL_DIR/"
cp ssl/odelink.shop.key "$SSL_DIR/"

# İzinleri ayarla
echo "🔒 İzinler ayarlanıyor..."
chmod 644 "$SSL_DIR/odelink.shop.pem"
chmod 600 "$SSL_DIR/odelink.shop.key"

echo "✅ Sertifikalar kuruldu: $SSL_DIR"
echo ""
echo "📝 Nginx config dosyası hazırlanıyor..."

# Nginx config dosyasını hazırla (sudo gerektirmeden)
NGINX_CONFIG_TEMP="$HOME/odelink-nginx-ssl.conf"

cat > "$NGINX_CONFIG_TEMP" <<EOF
# Odelink Nginx Configuration with Cloudflare Origin SSL
# Wildcard subdomain support for user sites

# Redirect HTTP to HTTPS (apex domain)
server {
    listen 80;
    listen [::]:80;
    server_name odelink.shop;
    
    return 301 https://www.odelink.shop\$request_uri;
}

# Redirect HTTP to HTTPS (www)
server {
    listen 80;
    listen [::]:80;
    server_name www.odelink.shop;
    
    return 301 https://www.odelink.shop\$request_uri;
}

# Main site HTTPS (www.odelink.shop)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.odelink.shop;
    
    # Cloudflare Origin SSL certificates
    ssl_certificate $SSL_DIR/odelink.shop.pem;
    ssl_certificate_key $SSL_DIR/odelink.shop.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Frontend static files
    root /home/odelink/odelink-shop/frontend/build;
    index index.html;
    
    # API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Frontend routes (React Router)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS (wildcard subdomain)
server {
    listen 80;
    listen [::]:80;
    server_name ~^(?<subdomain>[^.]+)\.odelink\.shop\$;
    
    # Exclude www from wildcard
    if (\$subdomain = "www") {
        return 404;
    }
    
    return 301 https://\$host\$request_uri;
}

# Wildcard subdomain HTTPS (*.odelink.shop)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ~^(?<subdomain>[^.]+)\.odelink\.shop\$;
    
    # Cloudflare Origin SSL certificates
    ssl_certificate $SSL_DIR/odelink.shop.pem;
    ssl_certificate_key $SSL_DIR/odelink.shop.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Exclude www from wildcard
    if (\$subdomain = "www") {
        return 404;
    }
    
    # All requests to backend (backend serves theme)
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Subdomain \$subdomain;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo "✅ Nginx config hazırlandı: $NGINX_CONFIG_TEMP"
echo ""
echo "⚠️  MANUEL ADIM GEREKLİ:"
echo ""
echo "Nginx config'i güncellemek için şu komutu çalıştır:"
echo ""
echo "  sudo cp $NGINX_CONFIG_TEMP /etc/nginx/sites-available/odelink"
echo "  sudo nginx -t"
echo "  sudo systemctl reload nginx"
echo ""
echo "Veya tek komutta:"
echo ""
echo "  sudo bash -c 'cp $NGINX_CONFIG_TEMP /etc/nginx/sites-available/odelink && nginx -t && systemctl reload nginx'"
echo ""
