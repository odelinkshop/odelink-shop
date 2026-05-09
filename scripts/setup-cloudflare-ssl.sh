#!/bin/bash
set -e

echo "🔐 Cloudflare Origin Certificate Setup"
echo "======================================="
echo ""
echo "Bu script Cloudflare Origin Certificate'i Nginx'e kuracak."
echo ""
echo "Önce Cloudflare Dashboard'dan Origin Certificate oluşturmalısınız:"
echo "1. Cloudflare Dashboard → SSL/TLS → Origin Server"
echo "2. 'Create Certificate' butonuna tıklayın"
echo "3. Private key type: RSA (2048)"
echo "4. Hostnames: *.odelink.shop, odelink.shop"
echo "5. Certificate Validity: 15 years"
echo "6. 'Create' butonuna tıklayın"
echo ""
echo "Sertifika ve private key'i kopyalayıp aşağıya yapıştırın."
echo ""

# Create SSL directory
mkdir -p /etc/ssl/cloudflare

# Get certificate
echo "📝 Origin Certificate'i yapıştırın (-----BEGIN CERTIFICATE----- ile başlayıp -----END CERTIFICATE----- ile biten tüm metni):"
echo "Bittiğinde CTRL+D'ye basın:"
cat > /etc/ssl/cloudflare/odelink.shop.pem

echo ""
echo "📝 Private Key'i yapıştırın (-----BEGIN PRIVATE KEY----- ile başlayıp -----END PRIVATE KEY----- ile biten tüm metni):"
echo "Bittiğinde CTRL+D'ye basın:"
cat > /etc/ssl/cloudflare/odelink.shop.key

# Set permissions
chmod 644 /etc/ssl/cloudflare/odelink.shop.pem
chmod 600 /etc/ssl/cloudflare/odelink.shop.key

echo ""
echo "✅ SSL sertifikaları kaydedildi"
echo ""

# Update Nginx configuration
echo "🔧 Nginx konfigürasyonu güncelleniyor..."

cat > /etc/nginx/sites-available/odelink.shop << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name odelink.shop www.odelink.shop;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name odelink.shop www.odelink.shop;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/odelink.shop.pem;
    ssl_certificate_key /etc/ssl/cloudflare/odelink.shop.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
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
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/health {
        proxy_pass http://127.0.0.1:5000/api/health;
        proxy_set_header X-Forwarded-Proto https;
        access_log off;
    }
}
EOF

# Test Nginx configuration
echo "🧪 Nginx konfigürasyonu test ediliyor..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx konfigürasyonu geçerli"
    echo "🔄 Nginx yeniden başlatılıyor..."
    systemctl reload nginx
    echo "✅ Nginx yeniden başlatıldı"
    echo ""
    echo "🎉 HTTPS kurulumu tamamlandı!"
    echo "🌐 Site artık https://www.odelink.shop adresinden erişilebilir"
else
    echo "❌ Nginx konfigürasyonu hatalı!"
    exit 1
fi
