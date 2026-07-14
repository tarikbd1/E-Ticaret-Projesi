import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      // 🔄 MİKTARI ARTIR / AZALT (YENİ EKLENEN KISIM)
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
      name: 'ecommerce-cart',
    }
  )
);