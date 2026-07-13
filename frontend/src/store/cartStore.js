import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],

      // 1. Sepete Ürün Ekleme (Eğer varsa miktarını artırır)
      addToCart: (product) => set((state) => {
        const existingItem = state.cartItems.find((item) => item._id === product._id);
        if (existingItem) {
          return {
            cartItems: state.cartItems.map((item) =>
              item._id === product._id ? { ...item, qty: item.qty + 1 } : item
            ),
          };
        }
        return { cartItems: [...state.cartItems, { ...product, qty: 1 }] };
      }),

      // 2. Sepetten Ürün Silme
      removeFromCart: (id) => set((state) => ({
        cartItems: state.cartItems.filter((item) => item._id !== id),
      })),

      // 3. Ürün Miktarını Güncelleme (+ / - butonları için)
      updateQuantity: (id, qty) => set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item._id === id ? { ...item, qty: Math.max(1, qty) } : item
        ),
      })),
    }),
    {
      name: 'cart-storage', // Sayfa yenilense bile sepetin kaybolmamasını sağlar
    }
  )
);