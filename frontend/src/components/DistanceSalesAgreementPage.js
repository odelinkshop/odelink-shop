import React from 'react';
import { useNavigate } from 'react-router-dom';
import LegalPageLayout from './LegalPageLayout';

const DistanceSalesAgreementPage = () => {
  const navigate = useNavigate();
  return (
    <LegalPageLayout title="Mesafeli Satış Sözleşmesi" lastUpdated="21.04.2026">
      <section className="space-y-6">
        <p className="font-bold text-center border-b border-white/10 pb-4 uppercase tracking-widest">
          MESAFELİ SATIŞ SÖZLEŞMESİ
        </p>

        <h2>MADDE 1: TARAFLAR</h2>
        <p>
          <strong>1.1. SATICI:</strong>
          <br />Ünvan: Ödelink Platformu (Bundan sonra "SATICI" olarak anılacaktır)
          <br />E-posta: support@odelink.shop
          <br />Hizmet Adresi: www.odelink.shop
        </p>
        <p>
          <strong>1.2. ALICI:</strong>
          <br />Ödelink platformu üzerinden hizmet satın alan, kayıt formunda bilgileri yer alan gerçek veya tüzel kişidir. (Bundan sonra "ALICI" olarak anılacaktır)
        </p>

        <h2>MADDE 2: SÖZLEŞMENİN KONUSU</h2>
        <p>
          İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait www.odelink.shop web sitesi üzerinden elektronik ortamda siparişini verdiği, aşağıda nitelikleri ve satış fiyatı belirtilen dijital hizmetin (SaaS Abonelik Planı) satışı ve ifası ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
        </p>

        <h2>MADDE 3: SÖZLEŞME KONUSU HİZMET VE ÖDEME</h2>
        <p>
          Sözleşme konusu hizmet; ALICI'nın seçtiği Standart veya Profesyonel abonelik planıdır. Hizmet bedeli, sipariş anında ALICI'ya sunulan ve Shopier ödeme sayfası üzerinden tahsil edilen tutardır. Abonelik süreleri, ödeme planına göre aylık veya yıllık olarak belirlenir.
        </p>

        <h2>MADDE 4: HİZMETİN TESLİMİ VE İFA ŞEKLİ</h2>
        <p>
          Sözleşme konusu hizmet bir "Dijital İçerik/Hizmet" olduğundan, ALICI'nın ödeme işlemini başarıyla tamamlaması ve SATICI tarafından sistemsel aktivasyonun yapılması (en geç 24 saat içinde) ile ifa edilmiş sayılır. Fiziksel bir ürün teslimatı söz konusu değildir.
        </p>

        <h2>MADDE 5: CAYMA HAKKI VE İSTİSNALARI</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği m. 15/ğ uyarınca; elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde cayma hakkı kullanılamaz. ALICI, bu hizmeti satın alarak hizmetin ifasına başlanmasına onay vermiş ve cayma hakkının ortadan kalkacağını kabul etmiş sayılır.
        </p>

        <h2>MADDE 6: TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ</h2>
        <ul>
          <li>SATICI, sözleşme konusu hizmeti dürüstlük ilkeleri çerçevesinde, teknik aksaklıklar hariç kesintisiz olarak sunmakla yükümlüdür.</li>
          <li>ALICI, hizmeti kullanırken Türkiye Cumhuriyeti yasalarına, genel ahlak kurallarına ve Platform kullanım şartlarına uymayı kabul eder.</li>
          <li>Sistemsel güncellemeler veya periyodik bakımlar nedeniyle oluşabilecek kısa süreli kesintiler ifa kusuru sayılmaz.</li>
        </ul>

        <h2>MADDE 7: YETKİLİ MAHKEME</h2>
        <p>
          İşbu Sözleşme'den doğabilecek uyuşmazlıklarda, T.C. Ticaret Bakanlığı tarafından ilan edilen değere kadar Tüketici Hakem Heyetleri, bu değerin üzerindeki durumlarda ise ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
        </p>

        <h2>MADDE 8: YÜRÜRLÜK</h2>
        <p>
          ALICI, Platform üzerinden satın alma işlemini onayladığında işbu Sözleşme'nin tüm maddelerini okumuş ve kabul etmiş sayılır. Sözleşme, ödemenin başarılı şekilde gerçekleştiği tarih itibarıyla yürürlüğe girer.
        </p>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <button type="button" onClick={() => navigate('/contact')} className="text-sm text-gray-500 hover:text-white transition-colors">
            Sözleşme hakkında sorularınız mı var? Bize yazın.
          </button>
        </div>
      </section>
    </LegalPageLayout>
  );
};

export default DistanceSalesAgreementPage;
