import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 🚀 MÜHENDİSLİK DOKUNUŞU: Dinamik Sepet Anahtarı Üretici
// Kim giriş yapmışsa onun mailiyle çekmece açar, yapmamışsa misafir çekmecesi açar
const getDynamicKey = () => {
  // Next.js sunucu tarafında (SSR) patlamaması için kontrol
  if (typeof window === 'undefined') return 'cart_guest';

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.email) {
        return `cart_${user.email}`; // Örn: cart_ahmet@gmail.com
      }
    }
  } catch (error) {
    console.error('Kullanıcı parse hatası:', error);
  }
  return 'cart_guest'; // Kimse giriş yapmamışsa misafir sepetini kullan
};

// 🧠 ZUSTAND İÇİN ÖZEL DEPO (STORAGE) MOTORU
// Zustand standart localStorage yerine bizim bu motorumuzu kullanacak
const dynamicStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(getDynamicKey());
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getDynamicKey(), value);
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getDynamicKey());
  },
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // 🛒 SEPETE ÜRÜN EKLE
      addToCart: (product, quantity = 1) => {
        const currentCart = get().cartItems;
        const existingItem = currentCart.find((item) => item._id === product._id);

        if (existingItem) {
          set({
            cartItems: currentCart.map((item) =>
              item._id === product._id
                ? { ...item, qty: item.qty + quantity }
                : item
            ),
          });
        } else {
          set({ cartItems: [...currentCart, { ...product, qty: quantity }] });
        }
      },

      // 🔄 MİKTARI ARTIR / AZALT
      updateQuantity: (productId, amount) => {
        set({
          cartItems: get().cartItems.map((item) => {
            if (item._id === productId) {
              const newQty = item.qty + amount;
              // Miktar 1'in altına düşmesin. Silmek isteyen çöp kutusunu kullansın.
              return { ...item, qty: newQty > 0 ? newQty : 1 };
            }
            return item;
          }),
        });
      },

      // 🗑️ SEPETTEN ÜRÜN SİL
      removeFromCart: (productId) => {
        set({
          cartItems: get().cartItems.filter((item) => item._id !== productId),
        });
      },

      // 🧹 SEPETİ TAMAMEN BOŞALT
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'ecommerce-cart', // Zustand bu ismi zorunlu ister, ama biz altta dynamicStorage ile eziyoruz!
      storage: createJSONStorage(() => dynamicStorage), // 🔥 Özel motorumuzu bağladık
    }
  )
);