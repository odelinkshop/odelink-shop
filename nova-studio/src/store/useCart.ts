import { create } from 'zustand';

export interface CartItem {
  id: string; // Unique ID (productId + variations)
  productId: string;
  name: string;
  /** Shopier'den "150 TL" gibi string gelebilir */
  price: string | number;
  image: string;
  size: string;
  quantity: number;
}

/** Fiyatı her zaman sayıya çevirir */
export const toNum = (p: string | number): number => {
  if (typeof p === 'number') return p;
  const n = parseFloat(String(p).replace(/[^0-9.,]/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

const calcTotal = (items: CartItem[]) =>
  items.reduce((acc, item) => acc + toNum(item.price) * item.quantity, 0);

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  addItem: (newItem: CartItem) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === newItem.id);
    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map(item =>
        item.id === newItem.id
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      );
    } else {
      newItems = [...items, newItem];
    }
    set({ items: newItems, total: calcTotal(newItems) });
  },
  removeItem: (id: string) => {
    const newItems = get().items.filter(item => item.id !== id);
    set({ items: newItems, total: calcTotal(newItems) });
  },
  updateQuantity: (id: string, quantity: number) => {
    const newItems = get().items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    set({ items: newItems, total: calcTotal(newItems) });
  },
  clearCart: () => set({ items: [], total: 0 }),
}));
