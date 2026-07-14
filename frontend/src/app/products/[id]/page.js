'use client';
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params); 
  const id = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (data.success) setProduct(data.data);
      } catch (error) {
        toast.error('Ürün detayları çekilemedi!');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    for(let i = 0; i < quantity; i++) {
      cart.push(product);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${quantity} adet ${product.name} sepete eklendi!`);
  };

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold">Yükleniyor...</div>;
  if (!product) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold">Ürün bulunamadı.</div>;

  const imageSrc = product.image || product.imageUrl;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-[70px] pb-20">
      <ToastContainer theme="dark" />
      
      {/* 🚀 ÜST BAR: Geri Dön Butonu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6">
        <Link 
          href="/products" 
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <span className="bg-slate-900 group-hover:bg-indigo-500/20 p-2 rounded-lg transition-colors border border-slate-800/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </span>
          Tüm Ürünlere Dön
        </Link>
      </div>

      {/* 🔥 ANA İÇERİK: İkiye Bölünmüş Düzen */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ================= SOL TARAF: FOTOĞRAF ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#050B14] aspect-square rounded-[2rem] flex items-center justify-center relative p-8 border border-slate-800/50 shadow-[0_0_40px_-15px_rgba(99,102,241,0.15)] group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-60"></div>
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt={product.name} 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            ) : (
              <span className="text-9xl drop-shadow-2xl z-10 opacity-80">📦</span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={`aspect-square rounded-xl flex items-center justify-center border cursor-pointer transition-colors ${item === 1 ? 'bg-[#050B14] border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
                 {imageSrc ? (
                    <img src={imageSrc} className="w-2/3 h-2/3 object-contain opacity-70" alt="" />
                 ) : (
                    <span className="text-2xl opacity-50">📦</span>
                 )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= SAĞ TARAF: ÜRÜN BİLGİLERİ ================= */}
        <div className="lg:col-span-7 flex flex-col justify-start py-2">
          
          {/* Etiketler */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md text-[11px] font-black tracking-widest uppercase border border-emerald-500/20">
              Kargo Bedava
            </span>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md text-[11px] font-black tracking-widest uppercase border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Stokta Var ({product.stock})
            </span>
          </div>

          {/* Ürün Adı */}
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Fiyat */}
          <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 mb-6 drop-shadow-sm">
            {product.price.toLocaleString('tr-TR')} TL
          </div>

          {/* İŞLEM ALANI: Küçültüldü ve Yukarı Alındı */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8">
            
            {/* Adet Seçici (Daha Kibar) */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-28 h-[50px] overflow-hidden shrink-0">
              <button 
                onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                className="w-10 h-full text-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center"
              >
                -
              </button>
              <span className="font-bold text-base text-white">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)}
                className="w-10 h-full text-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>

            {/* Sepete Ekle Butonu (Daha Kibar) */}
            <button 
              onClick={addToCart}
              disabled={product.stock === 0}
              className={`flex-1 h-[50px] rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                product.stock > 0 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] active:scale-[0.98]' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {product.stock > 0 ? 'Sepete Ekle' : 'Tükendi'}
            </button>
          </div>

          {/* AÇIKLAMA ALANI: Butonun hemen altına taşındı */}
          <div className="border-t border-slate-800/60 pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
              Ürün Açıklaması
            </h3>
            <p className="text-slate-300 text-base leading-relaxed font-medium">
              {product.description || "Bu ürün hakkında henüz detaylı bir açıklama girilmemiştir. Sitemizde yer alan tüm ürünler kendi kategorilerinde en yüksek performans ve kalite testlerinden geçerek sizlere sunulmaktadır."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}