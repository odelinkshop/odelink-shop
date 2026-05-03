#!/bin/bash
set -e

echo "🔧 Bakım modu aktifleştiriliyor..."

# Maintenance flag dosyası oluştur
touch /var/www/odelink-shop/.maintenance

# Nginx config'e maintenance check ekle (eğer yoksa)
NGINX_CONF="/etc/nginx/sites-available/odelink"

if [ -f "$NGINX_CONF" ]; then
    # Backup al
    cp "$NGINX_CONF" "$NGINX_CONF.backup"
    
    # Maintenance mode snippet'i ekle (eğer yoksa)
    if ! grep -q "maintenance" "$NGINX_CONF"; then
        # Ana server bloğunun başına ekle
        sed -i '/server {/a\    # Maintenance mode check\n    if (-f /var/www/odelink-shop/.maintenance) {\n        return 503;\n    }\n\n    error_page 503 @maintenance;\n    location @maintenance {\n        root /var/www/odelink-shop/frontend/build;\n        rewrite ^(.*)$ /maintenance.html break;\n    }' "$NGINX_CONF"
        
        # Nginx'i reload et
        nginx -t && systemctl reload nginx
        echo "✅ Nginx güncellendi ve reload edildi"
    fi
fi

echo "✅ Bakım modu aktif!"
