'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCartAction = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity); // Yeni fonksiyonu çektik
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemove = (productId) => {
    removeFromCartAction(productId);
    toast.info('Ürün sepetten çıkarıldı.');
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * (item.qty || 1)), 0);

  // BEYAZ EKRAN PATLAMASINI ÖNLEYEN KARANLIK YÜKLEME EKRANI
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-indigo-400 font-bold text-sm tracking-widest uppercase animate-pulse">Sepet Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-[100px] pb-20">
      <ToastContainer theme="dark" position="bottom-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-10 tracking-tight">
          Sepetim
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-16 text-center shadow-2xl flex flex-col items-center">
            <div className="text-7xl mb-6 opacity-60">🛒</div>
            <h2 className="text-2xl font-bold text-slate-300 mb-8">Sepetiniz şu an boş.</h2>
            <Link href="/products" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 text-lg">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* SOL TARAF: Sepetteki Ürünler */}
            <div className="lg:col-span-8 space-y-5">
              {cartItems.map((item) => {
                const imageSrc = item.image || item.imageUrl;
                
                return (
                  <div key={item._id} className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/50 p-5 rounded-3xl border border-slate-800/80 shadow-xl group hover:border-indigo-500/50 transition-colors">
                    
                    {/* Görsel */}
                    <div className="w-full sm:w-32 h-32 bg-[#050B14] rounded-2xl flex items-center justify-center text-4xl overflow-hidden border border-slate-800/50 shrink-0 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-60"></div>
                      {imageSrc ? (
                        <img src={imageSrc} alt={item.name} className="w-full h-full object-contain p-2 relative z-10 drop-shadow-lg group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="relative z-10 opacity-80">📦</span>
                      )}
                    </div>

                    {/* Bilgiler ve Adet Seçici */}
                    <div className="flex-1 text-center sm:text-left w-full">
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{item.name}</h3>
                      
                      {/* 🔥 İŞTE BURASI: Fiyat ve Adet Seçici Yan Yana */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-indigo-400 font-extrabold text-2xl">
                          {(item.price * item.qty).toLocaleString('tr-TR')} TL
                        </p>

                        {/* Adet Artırma / Azaltma Butonları */}
                        <div className="flex items-center justify-center sm:justify-end gap-3">
                          <div className="flex items-center justify-between bg-slate-950 border border-slate-700/60 rounded-xl w-28 h-10 overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item._id, -1)}
                              className="w-10 h-full text-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-bold text-base text-white">{item.qty}</span>
                            <button 
                              onClick={() => updateQuantity(item._id, 1)}
                              className="w-10 h-full text-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          
                          {/* Çöp Kutusu */}
                          <button 
                            onClick={() => handleRemove(item._id)}
                            className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white w-10 h-10 rounded-xl transition-all font-bold flex items-center justify-center border border-rose-500/20 hover:border-rose-500"
                            title="Sepetten Çıkar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* SAĞ TARAF: Sipariş Özeti */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-800/80 shadow-2xl sticky top-28">
                <h2 className="text-2xl font-black text-white mb-6 border-b border-slate-800 pb-4">
                  Sipariş Özeti
                </h2>
                
                <div className="space-y-5 mb-6">
                  <div className="flex justify-between items-center text-slate-300 font-medium">
                    <span>Ara Toplam ({cartItems.reduce((acc, item) => acc + item.qty, 0)} Ürün)</span>
                    <span>{totalPrice.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 font-medium">
                    <span>Kargo Ücreti</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-md text-[11px] tracking-widest uppercase border border-emerald-500/20">
                      Ücretsiz
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-800">
                  <span className="text-lg font-bold text-slate-400">Genel Toplam</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 drop-shadow-sm">
                    {totalPrice.toLocaleString('tr-TR')} TL
                  </span>
                </div>
                
                <button 
                  onClick={() => alert("Ödeme altyapısı (Iyzico/Stripe) entegre edilecek!")}
                  className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-lg py-5 rounded-2xl transition-all shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Sepeti Onayla
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}