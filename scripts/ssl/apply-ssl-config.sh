#!/bin/bash

# SSL Config Uygulama Script'i
# Bu script'i VPS'te sudo ile çalıştır

set -e

echo "🔐 SSL Config Uygulanıyor..."

as_root() {
  [ "$(id -u)" -eq 0 ]
}

run_priv() {
  if as_root; then
    "$@"
    return
  fi

  if sudo -n true 2>/dev/null; then
    sudo -n "$@"
    return
  fi

  echo "❌ Hata: sudo parola istiyor (non-interactive ortam)." >&2
  echo "Çözüm seçenekleri:" >&2
  echo "  1) GitHub Actions secrets içinde VPS_USER=root kullan (root SSH key ile)" >&2
  echo "  2) Deploy kullanıcısına NOPASSWD sudo yetkisi ver (cp/nginx/systemctl için)" >&2
  echo "Örnek (VPS'te root olarak):" >&2
  echo "  echo 'murat ALL=(ALL) NOPASSWD: /bin/cp, /usr/sbin/nginx, /bin/systemctl' | tee /etc/sudoers.d/odelink-nginx" >&2
  echo "  chmod 440 /etc/sudoers.d/odelink-nginx" >&2
  exit 1
}

# Nginx config dosyasını kontrol et
if [ ! -f "$HOME/odelink-nginx-ssl.conf" ]; then
    echo "❌ Hata: $HOME/odelink-nginx-ssl.conf bulunamadı!"
    echo "Önce 'bash scripts/install-cloudflare-ssl.sh' çalıştır"
    exit 1
fi

# Nginx config'i kopyala
echo "📋 Nginx config kopyalanıyor..."
run_priv cp "$HOME/odelink-nginx-ssl.conf" /etc/nginx/sites-available/odelink

# Nginx test
echo "🔄 Nginx test ediliyor..."
run_priv nginx -t

if [ $? -eq 0 ]; then
    # Nginx reload
    echo "🔄 Nginx reload ediliyor..."
    run_priv systemctl reload nginx
    
    echo ""
    echo "✅ SSL KURULUMU TAMAMLANDI!"
    echo ""
    echo "🎉 Artık tüm subdomain'ler HTTPS ile çalışıyor!"
    echo ""
    echo "Test et:"
    echo "  https://www.odelink.shop"
    echo "  https://kriyataki.odelink.shop"
    echo ""
else
    echo "❌ Nginx config hatası! Lütfen kontrol edin."
    exit 1
fi
