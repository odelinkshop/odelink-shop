"use client";

import InfoPage from '@/components/layout/info-page-template';

export default function AboutPage() {
  return (
    <InfoPage 
      title="Hakkımızda" 
      subtitle="BİZ KİMİZ?" 
      content={
        <div className="space-y-8">
          <p className="text-xl italic font-serif">
            "Sadelik en üstün sofistikasyondur." — Leonardo da Vinci
          </p>
          <p>
            [MAĞAZA İSMİ], modern aristokrasinin sessiz lüksünü ve zamansız tasarım anlayışını dijital dünyaya taşımak amacıyla kuruldu. Her parçamızda kaliteyi, zarafeti ve minimalizmi ön planda tutuyoruz.
          </p>
          <div className="bg-white/5 p-8 rounded-sm border border-white/10 italic">
            <p className="text-accent text-xs font-black tracking-widest uppercase mb-4">Editörün Notu:</p>
            "Buraya mağazanızın hikayesini, vizyonunu ve müşterilerinize sunduğunuz özel değeri anlatan etkileyici bir metin yazın. Müşterileriniz kimden alışveriş yaptıklarını bilmek isterler."
          </div>
          <p>
            Koleksiyonlarımız, sadece birer ürün değil; birer yaşam biçimi sunar. Sizi, gereksiz kalabalıktan arınmış, sadece en iyinin kaldığı o özel dünyaya davet ediyoruz.
          </p>
        </div>
      } 
    />
  );
}
