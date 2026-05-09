#!/bin/bash

# VDS Firewall Fix for GitHub Actions
# Bu script VDS'de GitHub Actions IP'lerine SSH erişimi açar

echo "Fixing VDS firewall for GitHub Actions..."

# GitHub Actions IP ranges (meta API'den al)
echo "Fetching GitHub Actions IP ranges..."
GITHUB_IPS=$(curl -s https://api.github.com/meta | grep -oP '"actions":\s*\[\K[^\]]+' | tr -d '"' | tr ',' '\n')

if [ -z "$GITHUB_IPS" ]; then
  echo "ERROR: Could not fetch GitHub IPs"
  exit 1
fi

echo "GitHub Actions IP ranges:"
echo "$GITHUB_IPS"
echo ""

# UFW kullanıyorsa
if command -v ufw &> /dev/null; then
  echo "Detected UFW firewall"
  
  # SSH portunu tüm GitHub Actions IP'lerine aç
  echo "$GITHUB_IPS" | while read ip; do
    if [ ! -z "$ip" ]; then
      echo "Adding rule for $ip"
      sudo ufw allow from $ip to any port 22 comment "GitHub Actions"
    fi
  done
  
  sudo ufw reload
  echo "UFW rules updated!"
fi

# iptables kullanıyorsa
if command -v iptables &> /dev/null && ! command -v ufw &> /dev/null; then
  echo "Detected iptables firewall"
  
  echo "$GITHUB_IPS" | while read ip; do
    if [ ! -z "$ip" ]; then
      echo "Adding rule for $ip"
      sudo iptables -A INPUT -p tcp -s $ip --dport 22 -j ACCEPT
    fi
  done
  
  # iptables kurallarını kaydet
  if command -v netfilter-persistent &> /dev/null; then
    sudo netfilter-persistent save
  elif [ -f /etc/sysconfig/iptables ]; then
    sudo service iptables save
  fi
  
  echo "iptables rules updated!"
fi

# Firewall yoksa veya zaten açıksa
if ! command -v ufw &> /dev/null && ! command -v iptables &> /dev/null; then
  echo "No firewall detected or SSH already open"
fi

echo ""
echo "Done! GitHub Actions should now be able to connect."
echo ""
echo "Test connection from GitHub Actions by pushing to main branch."
