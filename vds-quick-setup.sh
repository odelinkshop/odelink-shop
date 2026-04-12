#!/bin/bash
set -e

echo "SSH key ekleniyor..."
mkdir -p /root/.ssh
chmod 700 /root/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1pLtrrl0+Z67nnqnXEcUJVNuSQ0mH7giFUtZSpMhQM odelink-deployment" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
systemctl restart sshd

echo "Firewall aciliyor..."
ufw allow 22/tcp
ufw allow 80/tcp  
ufw allow 443/tcp
echo "y" | ufw enable

echo "Sistem guncelleniyor..."
apt-get update -qq
apt-get install -y -qq git curl

echo "Proje indiriliyor..."
cd /root
git clone https://github.com/odelinkshop/odelink-shop.git || (cd odelink-shop && git pull)

echo "Kurulum scripti calistiriliyor..."
cd /root/odelink-shop
bash scripts/vds-one-command-setup.sh

echo "TAMAMLANDI!"
