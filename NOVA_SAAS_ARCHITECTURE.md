# 🏛️ Nova Aristocratic Premium — SaaS Architecture

Bu doküman, Nova temasının Odelink SaaS platformuna entegrasyonu ve teknik mimarisi hakkında rehber niteliğindedir.

## 🏗️ Mimari Yapı
Nova, Odelink ekosisteminde bağımsız bir **Theme Service** olarak çalışır.

- **Backend (Node.js/Express):** Tüm `*.odelink.shop` isteklerini karşılar ve bunları dinamik olarak Nova servisine (Port 3001) proxy eder.
- **Frontend (Next.js 16):** Mağaza verilerini subdomain üzerinden API'den çeker ve aristokratik tasarım bileşenlerine dağıtır.
- **Data Engine (Zustand):** Mağaza ayarlarını, ürünlerini ve sepet verilerini merkezi bir state olarak yönetir.

## 📡 Subdomain Yönlendirme (Multi-Tenant)
Backend `server.js` içerisinde kurulu olan proxy katmanı, gelen `Host` başlığını kontrol eder:
1. `api.odelink.shop` -> Backend API
2. `www.odelink.shop` -> Ana Tanıtım Sitesi (React)
3. `*.odelink.shop` -> **Nova Theme Service** (Dinamik Mağaza)

## 🎨 Editör (Ödelink Studio) Entegrasyonu
Nova, Editör içinden gelen `postMessage` sinyallerini dinler. Bu sayede kullanıcı renk veya yazı değiştirdiğinde, Nova **yenilenmeden** bu değişikliği önizleme ekranında gösterir.

### Desteklenen Değişkenler:
- `primaryColor`, `secondaryColor`, `accentColor`
- `heroTitle`, `heroSubtitle`, `heroButtonText`
- `announcementBar` content

## 🛠️ Kurulum ve Dağıtım (Deployment)

### Nova Servisini Başlatma
```bash
cd Nova
npm install
npm run dev # Geliştirme modu
npm run build && npm start # Üretim modu
```

### PM2 ile Canlıya Alma
```bash
pm2 start npm --name "odelink-nova" -- start --prefix Nova -- -p 3001
```

## 📜 Lisans ve Sahiplik
Bu tema **Odelink SaaS** platformu için özel olarak tasarlanmış "Aristocratic Premium" edisyonudur. İzinsiz kopyalanamaz veya dağıtılamaz.

---
**Versiyon:** 2.0.0 (Nova SaaS Era)
**Geliştirici:** Antigravity AI
