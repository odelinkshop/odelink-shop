# 📐 Ödelink Enterprise Mimarisi

Bu belge, Ödelink ekosisteminin teknik altyapısını ve veri akışını detaylandırır.

## 1. Dağıtık Yapı
Ödelink, yüksek trafik ve düşük gecikme süresi için tasarlanmış dağıtık bir yapıya sahiptir.

### 1.1 Ödelink Core (Backend)
Tüm iş mantığının, otomasyonun ve veri yönetiminin kalbidir.
*   **Elite Cluster:** Node.js kümeleri sayesinde eş zamanlı binlerce isteği işleyebilir.
*   **Super-Scraper:** Shopier verilerini "Stealth" modunda, IP engellerine takılmadan ayıklar.

### 1.2 Ödelink Studio (Frontend)
Kullanıcıların dükkanlarını yönettiği ve müşterilerin alışveriş yaptığı vitrin katmanıdır.
*   **Next.js 16:** SSR (Server Side Rendering) ile SEO uyumlu ve ışık hızında sayfalar.
*   **Studio Mode:** Gerçek zamanlı önizleme ve dükkan özelleştirme motoru.

## 2. Veri Güvenliği (Cyber-Armor)
Verileriniz Ödelink'in siber zırhı ile korunur:
*   **SSL/TLS:** Uçtan uca şifreleme.
*   **Subdomain Isolation:** Her satıcı kendi izole subdomain alanında çalışır.
*   **Database Master:** PostgreSQL ile ilişkisel ve güvenli veri depolama.

## 3. Altyapı ve Ölçeklendirme
*   **Docker Integration:** Her bileşen konteynırize edilmiştir, saniyeler içinde yeni sunuculara taşınabilir.
*   **Cloudflare DNS:** Dünya genelinde hızlı erişim ve DDOS koruması.

---
🏛️ **Ödelink Enterprise Mühendislik Ekibi**
