'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';

export default function CustomerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#020617] p-8 pt-28">
      <ToastContainer theme="dark" />
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-4xl font-extrabold text-white mb-10 text-center tracking-tight">
          Tüm Ürünler
        </h1>

        {/* 🚀 SKELETON YÜKLEME EKRANI (Hayalet Kutular) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/30 animate-pulse flex flex-col h-[380px]">
                {/* Resim Alanı İskeleti */}
                <div className="h-56 bg-slate-800/40 rounded-2xl mb-5"></div>
                {/* Başlık İskeleti */}
                <div className="h-6 bg-slate-800/40 rounded-lg mb-3 w-3/4"></div>
                {/* Fiyat İskeleti */}
                <div className="h-8 bg-slate-800/40 rounded-lg w-1/2 mb-5"></div>
                {/* Buton İskeleti */}
                <div className="mt-auto h-12 bg-slate-800/40 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          
          /* 🔥 GERÇEK ÜRÜNLER (Veri gelince burası görünür) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const imageSrc = product.image || product.imageUrl;
              
              return (
                <div key={product._id} className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-indigo-500 transition-all shadow-xl group flex flex-col h-full">
                  
                  {/* Resim Kutusu */}
                  <div className="h-56 bg-[#050B14] rounded-2xl mb-5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 border border-slate-800/50 relative shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-60"></div>
                    {imageSrc ? (
                      <img src={imageSrc} alt={product.name} className="w-full h-full object-contain p-4 relative z-10" />
                    ) : (
                      <span className="text-6xl drop-shadow-2xl z-10 opacity-80">📦</span>
                    )}
                  </div>
                  
                  {/* Detaylar */}
                  <div className="flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-indigo-400 font-extrabold text-xl mb-5 drop-shadow-sm mt-auto">
                      {product.price.toLocaleString('tr-TR')} TL
                    </p>
                    
                    <Link 
                      href={`/products/${product._id}`} 
                      className="block w-full text-center bg-indigo-600 py-3 rounded-xl text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
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