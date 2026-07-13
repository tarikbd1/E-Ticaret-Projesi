"use client";
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCartStore();

  // Sepetteki toplam fiyatı hesaplayan küçük bir matematik
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-white mb-4">Sepetiniz Bomboş</h2>
        <p className="text-slate-400 mb-8">Görünüşe göre henüz bir ürün eklemediniz.</p>
        <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8 border-b border-slate-800 pb-4">Alışveriş Sepeti</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Taraf: Ürün Listesi */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                
                {/* Ürün Görseli Alanı (Şimdilik renkli bir kutu, ileride resmi buraya koyarsın) */}
                <div className="w-24 h-24 bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-slate-500">Görsel</span>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-indigo-400 font-semibold">{item.price.toLocaleString('tr-TR')} TL</p>
                </div>

                {/* Adet Kontrolü ve Silme */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item._id, Math.max(1, item.qty - 1))}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 transition"
                    >-</button>
                    <span className="px-4 py-1 bg-slate-900 font-medium">{item.qty}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.qty + 1)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 transition"
                    >+</button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                    title="Ürünü Sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ Taraf: Sipariş Özeti */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-6">
            <h3 className="text-xl font-bold text-white mb-6">Sipariş Özeti</h3>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Ara Toplam</span>
                <span>{totalPrice.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Kargo</span>
                <span className="text-emerald-400">Ücretsiz</span>
              </div>
            </div>

            <div className="flex justify-between text-white font-extrabold text-2xl mb-8">
              <span>Toplam</span>
              <span>{totalPrice.toLocaleString('tr-TR')} TL</span>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-[0.98]">
              Ödeme Adımına Geç
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}