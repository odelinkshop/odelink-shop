import { Product } from "@/types/product";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "linen-safari-shirt",
    name: "AMALFI LINEN SAFARI SHIRT - SAND",
    description: "İtalyan keteninden üretilmiş, safari kesim, nefes alan lüks gömlek.",
    price: 1850,
    category: "linen",
    images: ["/cat_linen.png"],
    sku: "P-001",
    isNew: true,
    variants: {
      size: [
        { id: "s1", name: "S", value: "S", stock: 10 },
        { id: "s2", name: "M", value: "M", stock: 15 },
        { id: "s3", name: "L", value: "L", stock: 12 },
      ]
    }
  },
  {
    id: "2",
    slug: "sartorial-wool-trousers",
    name: "MILANO SARTORIAL WOOL TROUSERS",
    description: "Hassas terzilikle dikilmiş, %100 yün, klasik kesim pantolon.",
    price: 2450,
    category: "sartorial",
    images: ["/hero_italian.png"],
    sku: "P-002",
    isNew: true,
    variants: {
      size: [
        { id: "s1", name: "48", value: "48", stock: 5 },
        { id: "s2", name: "50", value: "50", stock: 8 },
        { id: "s3", name: "52", value: "52", stock: 4 },
      ]
    }
  },
  {
    id: "3",
    slug: "mediterranean-polo-silk",
    name: "MEDITERRANEAN SILK-COTTON POLO",
    description: "İpek ve pamuk karışımı, yumuşak dokulu lüks polo yaka tişört.",
    price: 1250,
    category: "essentials",
    images: ["/cat_knitwear.png"],
    sku: "P-003",
    isNew: false,
    variants: {
      size: [
        { id: "s1", name: "S", value: "S", stock: 20 },
        { id: "s2", name: "M", value: "M", stock: 25 },
        { id: "s3", name: "L", value: "L", stock: 15 },
      ]
    }
  },
  {
    id: "4",
    slug: "leather-woven-belt",
    name: "HAND-WOVEN ITALIAN LEATHER BELT",
    description: "El yapımı, gerçek İtalyan derisi örgülü kemer.",
    price: 850,
    category: "accessories",
    images: ["/cat_accessories.png"],
    sku: "P-004",
    isNew: false,
    variants: {
      size: [
        { id: "s1", name: "85", value: "85", stock: 10 },
        { id: "s2", name: "90", value: "90", stock: 12 },
        { id: "s3", name: "95", value: "95", stock: 8 },
      ]
    }
  },
  {
    id: "5",
    slug: "linen-pleated-shorts",
    name: "TUSCANY LINEN PLEATED SHORTS",
    description: "Pileli kesim, yüksek kalite keten şort.",
    price: 1450,
    category: "linen",
    images: ["/tuscany.png"],
    sku: "P-005",
    isNew: true,
    variants: {
      size: [
        { id: "s1", name: "48", value: "48", stock: 10 },
        { id: "s2", name: "50", value: "50", stock: 15 },
      ]
    }
  },
  {
    id: "6",
    slug: "cashmere-crewneck-knit",
    name: "ULTRA-SOFT CASHMERE CREWNECK",
    description: "En ince kaşmirden üretilmiş, zamansız triko.",
    price: 3250,
    category: "sartorial",
    images: ["/cat_knitwear.png"],
    sku: "P-006",
    isNew: true,
    variants: {
      size: [
        { id: "s1", name: "M", value: "M", stock: 5 },
        { id: "s2", name: "L", value: "L", stock: 3 },
      ]
    }
  },
  {
    id: "7",
    slug: "silk-pocket-square",
    name: "HAND-ROLLED SILK POCKET SQUARE",
    description: "Elde dikilmiş, İtalyan ipeği mendil.",
    price: 450,
    category: "accessories",
    images: ["/hero_italian.png"],
    sku: "P-007",
    isNew: false,
    variants: {
      size: [
        { id: "s1", name: "OS", value: "OS", stock: 50 },
      ]
    }
  },
  {
    id: "8",
    slug: "essential-linen-tshirt",
    name: "THE ESSENTIAL LINEN T-SHIRT",
    description: "Günlük kullanım için ideal, hafif ve şık keten tişört.",
    price: 850,
    category: "essentials",
    images: ["/cat_linen.png"],
    sku: "P-008",
    isNew: false,
    variants: {
      size: [
        { id: "s1", name: "S", value: "S", stock: 30 },
        { id: "s2", name: "M", value: "M", stock: 40 },
        { id: "s3", name: "L", value: "L", stock: 20 },
      ]
    }
  }
];
