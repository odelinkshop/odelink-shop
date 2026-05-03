#!/bin/bash
set -e

echo "🔧 Installing and configuring Nginx..."

# Install Nginx
apt-get update
apt-get install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/odelink.shop <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name odelink.shop www.odelink.shop;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name odelink.shop www.odelink.shop;

    # SSL certificates (Cloudflare Origin Certificate)
    ssl_certificate /etc/nginx/ssl/odelink.shop.pem;
    ssl_certificate_key /etc/nginx/ssl/odelink.shop.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to backend
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://127.0.0.1:5000/api/health;
        access_log off;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/odelink.shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Create SSL directory
mkdir -p /etc/nginx/ssl

echo "✅ Nginx installed and configured"
echo "⚠️  SSL certificates need to be added to /etc/nginx/ssl/"
echo "    - odelink.shop.pem (certificate)"
echo "    - odelink.shop.key (private key)"
echo ""
echo "To get Cloudflare Origin Certificate:"
echo "1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server"
echo "2. Create Certificate"
echo "3. Copy certificate to /etc/nginx/ssl/odelink.shop.pem"
echo "4. Copy private key to /etc/nginx/ssl/odelink.shop.key"
echo "5. Run: systemctl restart nginx"
