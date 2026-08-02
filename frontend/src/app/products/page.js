'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { useCartStore } from '@/store/cartStore';

export default function CustomerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // FİLTRELEME & SIRALAMA STATE'LERİ
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  //  YENİ: SAYFALAMA (PAGINATION) STATE'İ
  const ITEMS_PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  //  YENİ: FAVORİLER STATE'İ
  const [favorites, setFavorites] = useState([]);

  const addToCartAction = useCartStore ? useCartStore((state) => state.addToCart) : null;

  useEffect(() => {
    //  Sayfa yüklendiğinde tarayıcıdaki favorileri çek
    const savedFavs = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavs);

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

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map((p) => p.category?.trim() || 'Genel'));
    return ['Tümü', ...Array.from(uniqueCategories).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'Tümü') {
      result = result.filter((p) => (p.category?.trim() || 'Genel') === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(query));
    }

    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, selectedCategory, searchQuery, sortOrder]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchQuery, sortOrder]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleQuickAdd = (e, product) => {
    e.preventDefault(); 
    if (addToCartAction) {
      addToCartAction(product, 1);
      toast.success(`${product.name} sepete eklendi!`, { position: 'bottom-right' });
    } else {
      toast.info('Sepet modülü entegre edilecek.');
    }
  };

  // Favori Ekleme/Çıkarma Mantığı
  const toggleFavorite = (e, productId) => {
    e.preventDefault(); 
    
    let updatedFavs;
    if (favorites.includes(productId)) {
      // Zaten favorilerdeyse çıkart
      updatedFavs = favorites.filter(id => id !== productId);
      toast.info('Favorilerden çıkarıldı', { position: 'bottom-right', autoClose: 1500 });
    } else {
      // Değilse ekle
      updatedFavs = [...favorites, productId];
      toast.success('Favorilere eklendi!', { position: 'bottom-right', icon: '❤️', autoClose: 1500 });
    }
    
    // State'i ve Tarayıcı hafızasını güncelle
    setFavorites(updatedFavs);
    localStorage.setItem('favorites', JSON.stringify(updatedFavs));
    
    // Profil/Dashboard sayfasını haberdar et
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 sm:p-8 pt-28">
      <ToastContainer theme="dark" />
      <div className="max-w-7xl mx-auto">
        
        {/* Üst Tanıtım Bölümü */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase border border-indigo-500/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            {loading ? 'Yükleniyor' : `${filteredProducts.length} Ürün Bulundu`}
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Tüm Ürünler
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            İhtiyacınıza uygun ürünü kategorilere göz atarak kolayca bulabilirsiniz.
          </p>
        </div>

        {/* Kontrol Paneli (Arama & Sıralama & Kategori) */}
        {!loading && (
          <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-[2rem] mb-10 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-950/50 border border-slate-800 text-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none md:w-64 appearance-none cursor-pointer"
              >
                <option value="default">Önerilen Sıralama</option>
                <option value="price-asc">En Düşük Fiyat</option>
                <option value="price-desc">En Yüksek Fiyat</option>
              </select>
            </div>

            {categories.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                        : 'bg-[#050B14] text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skeleton Yükleme Ekranı */}
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
          <div className="text-center py-20 bg-slate-900/20 rounded-[2rem] border border-slate-800/50 border-dashed">
            <span className="text-5xl mb-4 block opacity-50">🔍</span>
            <p className="text-slate-400 font-medium text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('Tümü'); setSortOrder('default');}}
              className="mt-4 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <>
            {/* GERÇEK ÜRÜNLER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {displayedProducts.map((product) => {
                const imageSrc = product.image || product.imageUrl;
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= 3;
                
                // Bu ürün favorilerde var mı kontrolü
                const isFavorite = favorites.includes(product._id);
                
                return (
                  <Link 
                    href={`/products/${product._id}`} 
                    key={product._id} 
                    className={`bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-xl group flex flex-col h-full relative ${isOutOfStock ? 'opacity-75 grayscale-[30%]' : 'hover:-translate-y-1 hover:shadow-indigo-500/10'}`}
                  >
                    <div className="h-56 bg-[#050B14] rounded-2xl mb-5 flex items-center justify-center overflow-hidden relative shrink-0 border border-slate-800/50">
                      
                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                        {product.category && (
                          <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-slate-950/80 text-indigo-300 border border-indigo-500/30 rounded-lg backdrop-blur-sm self-start">
                            {product.category}
                          </span>
                        )}
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg backdrop-blur-sm self-start">
                            Tükendi
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg backdrop-blur-sm self-start flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping"></span>
                            Son {product.stock} Ürün
                          </span>
                        ) : null}
                      </div>

                      {/* Dinamik Kalp İkonu */}
                      <button 
                        onClick={(e) => toggleFavorite(e, product._id)}
                        className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-xl border flex items-center justify-center backdrop-blur-md transition-all ${
                          isFavorite 
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 hover:bg-rose-500/30' // İçi dolu (Aktif)
                          : 'bg-slate-950/60 border-slate-700/50 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10' // Boş (İnaktif)
                        }`}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 transition-all duration-300" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          fill={isFavorite ? "currentColor" : "none"}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 1 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      {imageSrc && (
                        <>
                          <img src={imageSrc} alt="blur" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-125 group-hover:opacity-30 transition-opacity duration-500 z-0" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-80 z-0"></div>
                          <img src={imageSrc} alt={product.name} className="w-full h-full object-contain p-4 relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl" />
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-800/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fiyat</span>
                          <span className="text-indigo-400 font-extrabold text-xl drop-shadow-sm">
                            {product.price.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                        
                        <button 
                          onClick={(e) => handleQuickAdd(e, product)}
                          disabled={isOutOfStock}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            isOutOfStock
                            ? 'bg-slate-800/50 text-slate-600 border border-slate-700/50 cursor-not-allowed'
                            : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                          }`}
                          title={isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
                        >
                          {isOutOfStock ? (
                            <span className="text-[10px] font-black uppercase">Yok</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* DAHA FAZLA YÜKLE BUTONU */}
            {visibleCount < filteredProducts.length && (
              <div className="mt-14 flex justify-center">
                <button 
                  onClick={handleLoadMore}
                  className="group px-8 py-4 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-2xl font-bold text-slate-300 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center gap-3"
                >
                  <span>Daha Fazla Ürün Göster</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}