
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AISEOContentService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  /**
   * Ürün ismini ve açıklamasını SEO uyumlu hale getirir
   */
  async optimizeProduct(productName, rawDescription = "") {
    if (!this.model) return { name: productName, description: rawDescription };

    try {
      const prompt = `
        Sen profesyonel bir e-ticaret metin yazarı ve SEO uzmanısın. 
        Aşağıdaki ürün için Google arama sonuçlarında üst sıralarda çıkacak, 
        müşteriyi satın almaya ikna eden, modern ve şık bir Türkçe açıklama yaz.
        
        Ürün Adı: ${productName}
        Mevcut Açıklama: ${rawDescription}
        
        Kurallar:
        1. HTML formatında (sadece <p>, <ul>, <li> etiketleri kullanarak) çıktı ver.
        2. Anahtar kelimeleri doğal bir şekilde metne yedir.
        3. Çok uzun olmasın, öz ve etkileyici olsun.
        4. "Sessiz lüks" ve "premium kalite" vurgusu yap.
        
        Sadece ürün açıklamasını döndür.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        name: productName, // İstersek ismi de optimize ettirebiliriz
        description: response.text().trim()
      };
    } catch (error) {
      console.error("❌ AI Optimization Error:", error);
      return { name: productName, description: rawDescription };
    }
  }

  /**
   * Mağaza için meta başlık ve açıklama üretir
   */
  async generateStoreMeta(storeName, categories = []) {
    if (!this.model) return null;

    try {
      const prompt = `
        ${storeName} isimli bir e-ticaret mağazası için SEO uyumlu meta title ve meta description oluştur.
        Bu mağaza şu kategorilerde ürünler satıyor: ${categories.join(", ")}.
        
        Format:
        Title: [Maks 60 karakter]
        Description: [Maks 160 karakter]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const title = text.match(/Title: (.*)/)?.[1] || "";
      const description = text.match(/Description: (.*)/)?.[1] || "";

      return { title, description };
    } catch (error) {
      console.error("❌ AI Store Meta Error:", error);
      return null;
    }
  }
}

module.exports = new AISEOContentService();
