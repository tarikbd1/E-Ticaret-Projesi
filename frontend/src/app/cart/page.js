'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false); // Hydration hatasını önlemek için

  // Sayfa yüklendiğinde localStorage'dan sepeti çekiyoruz
  useEffect(() => {
    setMounted(true);
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
  }, []);

  // Sepetten Ürün Silme İşlemi
  const removeFromCart = (indexToRemove) => {
    const updatedCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart)); // Hafızayı da güncelliyoruz
    toast.info('Ürün sepetten çıkarıldı.');
  };

  // Toplam Fiyatı Hesaplama
  const totalPrice = cartItems.reduce((total, item) => total + (item.price || 0), 0);

  // Next.js hydration mismatch hatasını engellemek için
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 container mx-auto p-6 pt-28 text-white">
      <ToastContainer theme="dark" position="bottom-right" />
      <h1 className="text-4xl font-extrabold mb-8 text-center">Sepetim</h1>

      {cartItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-300 mb-6">Sepetiniz şu an boş.</h2>
          <Link href="/products" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Taraf: Sepetteki Ürünler Listesi */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item._id}-${index}`} className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center text-3xl">📦</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    <p className="text-indigo-400 font-bold">{item.price?.toLocaleString('tr-TR')} TL</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white p-3 rounded-xl transition-all font-bold"
                  title="Sepetten Çıkar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Sağ Taraf: Sipariş Özeti */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl h-fit sticky top-24">
            <h2 className="text-2xl font-bold mb-6 border-b border-slate-800 pb-4">Sipariş Özeti</h2>
            <div className="flex justify-between items-center mb-4 text-slate-300">
              <span>Ara Toplam ({cartItems.length} Ürün)</span>
              <span>{totalPrice.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-slate-300">
              <span>Kargo</span>
              <span className="text-emerald-400 font-bold">Ücretsiz</span>
            </div>
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-800">
              <span className="text-xl font-bold">Genel Toplam</span>
              <span className="text-3xl font-black text-indigo-400">{totalPrice.toLocaleString('tr-TR')} TL</span>
            </div>
            
            <button 
              onClick={() => alert("Ödeme altyapısı (Iyzico/Stripe) entegre edilecek!")}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-transform active:scale-95 shadow-lg shadow-indigo-500/25"
            >
              Sepeti Onayla
            </button>
          </div>

        </div>
      )}
    </div>
  );
}