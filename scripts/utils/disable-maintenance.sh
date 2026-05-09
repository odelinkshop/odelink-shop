#!/bin/bash
set -e

echo "✅ Bakım modu kapatılıyor..."

# Maintenance flag dosyasını sil
rm -f /var/www/odelink-shop/.maintenance

echo "✅ Bakım modu kapatıldı! Site tekrar aktif."
