# 🔑 VDS SSH Key Kurulumu

## SSH Key'i VDS'ye Ekle

### Yöntem 1: Bulutova Panelinden (Önerilen)

1. https://bulutova.com/hizmet-goruntuler&id=3429 adresine git
2. **"Konsol Aç"** butonuna tıkla
3. Aşağıdaki komutları çalıştır:

```bash
# SSH dizinini oluştur
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Public key'i ekle
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1pLtrrl0+Z67nnqnXEcUJVNuSQ0mH7giFUtZSpMhQM odelink-deployment" >> ~/.ssh/authorized_keys

# İzinleri ayarla
chmod 600 ~/.ssh/authorized_keys

# SSH servisini yeniden başlat
sudo systemctl restart sshd

echo "✅ SSH key eklendi!"
```

### Yöntem 2: SSH Şifre ile Bağlanarak

Eğer SSH şifreniz varsa:

```bash
# Windows PowerShell'den
ssh root@141.98.81.172

# Şifre gir, sonra:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1pLtrrl0+Z67nnqnXEcUJVNuSQ0mH7giFUtZSpMhQM odelink-deployment" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

## SSH Bağlantısını Test Et

```bash
# Windows PowerShell'den
ssh -i $HOME\.ssh\odelink_vds root@141.98.81.172 "echo 'SSH connection successful!'"
```

Başarılı olursa: `SSH connection successful!` yazısını göreceksin.

## GitHub Actions'ı Test Et

SSH key eklendikten sonra GitHub Actions otomatik çalışacak. Kontrol et:

1. https://github.com/odelinkshop/odelink-shop/actions adresine git
2. Son workflow'u kontrol et
3. Yeşil ✅ görürsen deployment başarılı!

## Manuel Deployment

SSH key ekledikten sonra manuel deployment için:

```bash
# Windows PowerShell'den
ssh -i $HOME\.ssh\odelink_vds root@141.98.81.172
```

Bağlandıktan sonra `VDS_MANUAL_SETUP.md` dosyasındaki adımları takip et.
