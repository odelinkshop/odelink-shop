# Odelink Shop Projesi İçin VPS İşletim Sistemi Tavsiyesi ve Kurulum Yol Haritası

**Yazar:** Manus AI
**Tarih:** 9 Nisan 2026

## 1. Giriş

Odelink Shop projenizin teknoloji yığını ve görselde belirtilen VPS özellikleri (8 çekirdek Intel Xeon CPU, 12 GB DDR4 RAM, 80 GB NVMe SSD, 10 Gbit Port) göz önüne alındığında, projenizin performanslı ve güvenli bir şekilde çalışması için en uygun işletim sistemi seçimi ve kurulum adımları bu raporda detaylandırılmıştır.

## 2. İşletim Sistemi Tavsiyesi: Linux

Odelink Shop projenizin temel bileşenleri olan Node.js (Express.js), PostgreSQL, Puppeteer ve `sharp` gibi teknolojiler, Linux tabanlı işletim sistemlerinde en iyi performansı, kararlılığı ve geliştirici deneyimini sunmaktadır. Bu nedenle, projeniz için kesinlikle bir Linux dağıtımı seçmeniz önerilir.

### Neden Linux?

*   **Performans ve Kaynak Verimliliği:** Linux sunucuları, Windows Server'a kıyasla genellikle daha az sistem kaynağı tüketir. Bu, aynı donanım üzerinde uygulamanızın daha fazla performans göstermesi anlamına gelir.
*   **Kararlılık ve Güvenlik:** Linux, sunucu ortamlarında uzun süreli çalışma kararlılığı ve güçlü güvenlik özellikleriyle bilinir. Geniş topluluk desteği sayesinde güvenlik güncellemeleri hızlı bir şekilde yayınlanır.
*   **Geliştirici Dostu Ortam:** Node.js, PostgreSQL ve ilgili tüm araçlar Linux üzerinde doğal olarak çalışır. `bash` betikleri ve `Docker` gibi DevOps araçları Linux ekosisteminde daha yaygın ve entegredir.
*   **Puppeteer ve `sharp` Desteği:** Özellikle Puppeteer gibi Chromium tabanlı araçlar ve `sharp` gibi görsel işleme kütüphaneleri, Linux ortamında bağımlılık yönetimi ve çalışma zamanı açısından daha sorunsuz bir deneyim sunar.

### Önerilen Linux Dağıtımları:

*   **Ubuntu Server LTS (Long Term Support):** Sunucu ortamları için en popüler ve iyi belgelenmiş dağıtımlardan biridir. Uzun süreli destek (5 yıl) sayesinde sık sık sürüm yükseltme ihtiyacı duymazsınız. Geniş bir paket deposuna ve aktif bir topluluğa sahiptir.
*   **Debian:** Ubuntu'nun temelini oluşturan, kararlılığı ve güvenliği ile bilinen bir diğer güçlü seçenektir. Daha minimalist bir kurulum sunar ve daha az kaynak tüketebilir.

**Özetle, Odelink Shop projeniz için özellikle Node.js ve Puppeteer kullanımı nedeniyle Ubuntu Server LTS (örneğin 22.04 LTS) en uygun seçim olacaktır.**

## 3. Kurulum Yol Haritası

VPS'inizi Ubuntu Server LTS ile kurduktan sonra, Odelink Shop projenizi canlıya almak için aşağıdaki adımları izleyebilirsiniz:

### 3.1. Temel Sunucu Kurulumu ve Güvenlik

1.  **SSH Erişimi:** VPS sağlayıcınızdan aldığınız bilgilerle sunucuya SSH üzerinden bağlanın.
    ```bash
    ssh kullanıcı_adı@vps_ip_adresi
    ```
2.  **Güvenlik Güncellemeleri:** Sistemi güncel tutun.
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
3.  **Yeni Bir Kullanıcı Oluşturma (isteğe bağlı ama önerilir):** `root` kullanıcısı yerine yetkileri kısıtlı bir kullanıcı ile çalışmak güvenlik açısından önemlidir.
    ```bash
    sudo adduser yeni_kullanıcı_adı
    sudo usermod -aG sudo yeni_kullanıcı_adı
    ```
4.  **SSH Anahtar Kimlik Doğrulaması:** Şifre yerine SSH anahtarları ile bağlanarak güvenliği artırın ve `root` ile SSH erişimini devre dışı bırakın.
5.  **Güvenlik Duvarı (UFW) Yapılandırması:** Sadece gerekli portları (SSH için 22, HTTP için 80, HTTPS için 443) açın.
    ```bash
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full' # Nginx kullanacaksanız
    sudo ufw enable
    ```

### 3.2. Gerekli Yazılımların Kurulumu

1.  **Git:** Proje kodunu GitHub'dan çekmek için.
    ```bash
    sudo apt install git -y
    ```
2.  **Node.js ve npm:** Projenizin çalışması için Node.js ve paket yöneticisi npm gereklidir. `nvm` (Node Version Manager) kullanmak, Node.js sürümlerini yönetmek için iyi bir yöntemdir.
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    source ~/.bashrc # veya ~/.zshrc
    nvm install --lts # En son LTS sürümünü kurar
    nvm use --lts
    ```
3.  **PostgreSQL Veritabanı:** Projenizin veritabanı için PostgreSQL kurun.
    ```bash
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    ```
4.  **Nginx (Ters Proxy ve Web Sunucusu):** Frontend dosyalarını sunmak, SSL sonlandırması yapmak ve backend API isteklerini yönlendirmek için Nginx kullanın.
    ```bash
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    ```
5.  **PM2 (Node.js Süreç Yöneticisi):** Node.js uygulamanızın arka planda sürekli çalışmasını sağlamak ve yeniden başlatmaları yönetmek için PM2 kullanın.
    ```bash
    npm install pm2 -g
    ```
6.  **Chromium (Puppeteer için):** Puppeteer'ın çalışması için headless bir tarayıcıya ihtiyacı vardır.
    ```bash
    sudo apt install chromium-browser -y # veya chromium
    ```
    *Not: `sharp` kütüphanesi genellikle `npm install` sırasında kendi bağımlılıklarını kurar. Eğer bir sorun yaşarsanız, `libvips-dev` gibi paketleri manuel olarak kurmanız gerekebilir: `sudo apt install libvips-dev -y`*

### 3.3. Veritabanı Yapılandırması

1.  **PostgreSQL Kullanıcısı ve Veritabanı Oluşturma:**
    ```bash
    sudo -i -u postgres
    createuser --interactive # veya createuser --pwprompt odelink_user
    createdb odelink_shop_db
    psql -c 
