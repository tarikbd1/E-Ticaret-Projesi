'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';

export default function CustomerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 YENİ: Kategori filtreleme state'i
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        if (data.success) setProducts(data.data);
      } catch (error) {
        toast.error('Ürünler yüklenemedi!');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🚀 YENİ: Ürünlerden benzersiz kategorileri otomatik çıkar (backend'e ayrı bir istek atmaya gerek yok)
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map((p) => p.category?.trim() || 'Genel'));
    return ['Tümü', ...Array.from(uniqueCategories).sort()];
  }, [products]);

  // 🚀 YENİ: Seçili kategoriye göre filtrelenmiş ürün listesi
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Tümü') return products;
    return products.filter((p) => (p.category?.trim() || 'Genel') === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#020617] p-8 pt-28">
      <ToastContainer theme="dark" />
      <div className="max-w-7xl mx-auto">
        
        {/* 🚀 GÜNCELLENDİ: Sade bir üst tanıtım bölümü + ürün sayısı rozeti */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase border border-indigo-500/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            {loading ? 'Yükleniyor' : `${filteredProducts.length} Ürün`}
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Tüm Ürünler
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            İhtiyacınıza uygun ürünü kategorilere göz atarak kolayca bulabilirsiniz.
          </p>
        </div>

        {/* 🚀 YENİ: Kategori Filtreleme Sekmeleri */}
        {!loading && categories.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-8 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 🚀 SKELETON YÜKLEME EKRANI (Hayalet Kutular) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/30 animate-pulse flex flex-col h-[380px]">
                <div className="h-56 bg-slate-800/40 rounded-2xl mb-5"></div>
                <div className="h-6 bg-slate-800/40 rounded-lg mb-3 w-3/4"></div>
                <div className="h-8 bg-slate-800/40 rounded-lg w-1/2 mb-5"></div>
                <div className="mt-auto h-12 bg-slate-800/40 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* 🚀 YENİ: Seçili kategoride ürün yoksa gösterilecek boş durum */
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block opacity-50">📦</span>
            <p className="text-slate-500 font-medium">Bu kategoride henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          
          /* 🔥 GERÇEK ÜRÜNLER (Veri gelince burası görünür) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const imageSrc = product.image || product.imageUrl;
              
              return (
                <div key={product._id} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-indigo-500 transition-all duration-300 shadow-xl group flex flex-col h-full hover:shadow-indigo-500/10 hover:shadow-2xl">
                  
                  {/* 🚀 GELİŞTİRİLMİŞ RESİM KUTUSU: her zaman object-contain + blur dolgu, ürün asla kırpılmaz */}
                  <div className="h-56 bg-[#050B14] rounded-2xl mb-5 flex items-center justify-center overflow-hidden relative shrink-0 border border-slate-800/50">
                    
                    {/* 🚀 YENİ: Kategori etiketi (kartın sol üst köşesi) */}
                    {product.category && (
                      <span className="absolute top-2 left-2 z-20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-slate-950/80 text-indigo-300 border border-indigo-500/30 rounded-md backdrop-blur-sm">
                        {product.category}
                      </span>
                    )}

                    {/* ❤️ Arka Plan Blur Efekti (Boşlukları Doldurur) */}
                    {imageSrc && (
                      <>
                        <img 
                          src={imageSrc} 
                          alt="blur-bg" 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110 group-hover:opacity-40 transition-opacity duration-500 z-0"
                        />
                        {/* İç karartma gradyanı (Ana resim daha net dursun diye) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-80 z-0"></div>
                      </>
                    )}

                    {/* Ana Resim: her zaman object-contain, ürün asla kırpılmadan tamamı görünür */}
                    {imageSrc ? (
                      <img 
                        src={imageSrc} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-4 relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl" 
                      />
                    ) : (
                      <span className="text-6xl drop-shadow-2xl z-10 opacity-80">📦</span>
                    )}
                  </div>
                  
                  {/* Detaylar */}
                  <div className="flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-indigo-400 font-extrabold text-xl mb-5 drop-shadow-sm mt-auto">
                      {product.price.toLocaleString('tr-TR')} TL
                    </p>
                    
                    <Link 
                      href={`/products/${product._id}`} 
                      className="block w-full text-center bg-indigo-600/90 py-3 rounded-xl text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      İncele
                    </Link>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
        
      </div>
    </div>
  );
}