#!/bin/bash
# Wildcard SSL Certificate Setup for *.odelink.shop
# This script will be run via GitHub Actions

set -e

echo "🔐 Setting up wildcard SSL certificate for *.odelink.shop"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Check if wildcard certificate already exists
if sudo certbot certificates 2>/dev/null | grep -q "*.odelink.shop"; then
    echo "✅ Wildcard certificate already exists"
    echo "🔄 Renewing certificate..."
    sudo certbot renew --nginx
else
    echo "📝 Creating new wildcard certificate..."
    echo ""
    echo "⚠️  IMPORTANT: You need to add a TXT record to DNS"
    echo "    This will be shown in the next step"
    echo ""
    
    # Request wildcard certificate
    sudo certbot certonly --manual --preferred-challenges dns \
        --server https://acme-v02.api.letsencrypt.org/directory \
        --agree-tos \
        --email muratbyrm3752@gmail.com \
        -d odelink.shop \
        -d *.odelink.shop
fi

# Update nginx configuration to use SSL
echo "🔧 Updating nginx configuration for SSL..."

# Backup current config
sudo cp /etc/nginx/sites-available/odelink /etc/nginx/sites-available/odelink.backup

# Create SSL-enabled nginx config
sudo tee /etc/nginx/sites-available/odelink > /dev/null <<'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name odelink.shop www.odelink.shop *.odelink.shop;
    
    return 301 https://$host$request_uri;
}

# Main site (www.odelink.shop) - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.odelink.shop;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/odelink.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/odelink.shop/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Frontend static files
    root /home/murat/odelink-shop/frontend/build;
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

# Wildcard subdomain for user sites (*.odelink.shop) - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ~^(?<subdomain>[^.]+)\.odelink\.shop$;
    
    # Exclude www from wildcard
    if ($subdomain = "www") {
        return 404;
    }
    
    # SSL Configuration (wildcard certificate)
    ssl_certificate /etc/letsencrypt/live/odelink.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/odelink.shop/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
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

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo "❌ Nginx configuration test failed"
    echo "🔙 Restoring backup..."
    sudo cp /etc/nginx/sites-available/odelink.backup /etc/nginx/sites-available/odelink
    exit 1
fi

echo ""
echo "✅ Wildcard SSL setup complete!"
echo "🌐 Your sites should now work with HTTPS:"
echo "   - https://www.odelink.shop"
echo "   - https://kriyataki.odelink.shop"
echo "   - https://*.odelink.shop"
