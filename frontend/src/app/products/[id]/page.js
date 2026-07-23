'use client';
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params); 
  const id = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const [mainImage, setMainImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (data.success) {
          setProduct(data.data);
          const initialImage = data.data.images?.[0] || data.data.image || data.data.imageUrl;
          setMainImage(initialImage);
        }
      } catch (error) {
        toast.error('Ürün detayları çekilemedi!');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success && data.favorites) {
          const favoriteIds = data.favorites.map((fav) => fav._id || fav);
          setIsFavorite(favoriteIds.includes(id));
        }
      } catch (error) {}
    };
    checkFavoriteStatus();
  }, [id]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Favorilere eklemek için giriş yapmalısınız!');
      router.push('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const { data } = await axios.delete(`http://localhost:5000/api/auth/favorite/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) { setIsFavorite(false); toast.success('Ürün favorilerden çıkarıldı!'); }
      } else {
        const { data } = await axios.post(`http://localhost:5000/api/auth/favorite/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) { setIsFavorite(true); toast.success('Ürün favorilere eklendi!'); }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Favori işlemi sırasında bir hata oluştu!');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const addToCartAction = useCartStore((state) => state.addToCart);

  const addToCart = () => {
    addToCartAction(product, quantity); 
    toast.success(`${quantity} adet ${product.name} sepete eklendi!`);
  };

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold animate-in fade-in duration-300">Yükleniyor...</div>;
  if (!product) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold animate-in fade-in duration-300">Ürün bulunamadı.</div>;

  const allImages = product.images?.length > 0 ? product.images : (product.image || product.imageUrl ? [product.image || product.imageUrl] : []);

  // 🚀 YENİ: PNG mi JPEG mi olduğunu URL'den anlayan yardımcı fonksiyon
  const isPngImage = (url) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.png');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-[70px] pb-20 animate-in fade-in duration-500">
      <ToastContainer theme="dark" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6">
        <button 
          onClick={() => router.push('/')}
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all font-bold text-sm uppercase tracking-widest cursor-pointer"
        >
          <span className="bg-slate-900 group-hover:bg-indigo-500/20 p-2 rounded-lg transition-colors border border-slate-800/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </span>
          Tüm Ürünlere Dön
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ================= SOL TARAF: FOTOĞRAF GALERİSİ ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-gradient-to-tr from-slate-950 via-[#0a1120] to-indigo-950/30 aspect-square rounded-[2rem] flex items-center justify-center relative border border-slate-800/60 shadow-[0_0_40px_-15px_rgba(99,102,241,0.2)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_60%)] z-0"></div>

            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              className={`absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-lg backdrop-blur-md ${
                isFavorite 
                  ? 'bg-rose-500/90 border-rose-500/40 text-white' 
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* 🚀 GÜNCELLEME: PNG ise contain + boşluklu (uzak), JPEG ise cover + boşluksuz (tam oturan) */}
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={product.name} 
                className={`w-full h-full z-10 animate-in fade-in zoom-in-95 duration-500 ${
                  isPngImage(mainImage) 
                    ? 'object-contain p-8 sm:p-12 drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]' 
                    : 'object-cover'
                }`}
              />
            ) : (
              <span className="text-9xl z-10 opacity-80 relative drop-shadow-2xl">📦</span>
            )}
          </div>

          {/* 📸 KÜÇÜK FOTOĞRAFLAR (THUMBNAILS) */}
          {allImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, index) => (
                <div 
                  key={index} 
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all overflow-hidden bg-gradient-to-tr from-slate-950 to-slate-900 ${
                    mainImage === img 
                      ? 'border-2 border-indigo-500 opacity-100 scale-95 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]' 
                      : 'border border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                  }`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)] z-0"></div>
                  {/* 🚀 GÜNCELLEME: PNG ise contain + boşluklu (uzak), JPEG ise cover + boşluksuz (tam oturan) */}
                  <img 
                    src={img} 
                    className={`w-full h-full z-10 ${isPngImage(img) ? 'object-contain p-3' : 'object-cover'}`}
                    alt={`${product.name} - Görsel ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= SAĞ TARAF: ÜRÜN BİLGİLERİ ================= */}
        <div className="lg:col-span-7 flex flex-col justify-start py-2">
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md text-[11px] font-black tracking-widest uppercase border border-emerald-500/20">
              Kargo Bedava
            </span>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md text-[11px] font-black tracking-widest uppercase border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Stokta Var ({product.stock})
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 mb-6 drop-shadow-sm">
            {product.price.toLocaleString('tr-TR')} TL
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-28 h-[50px] overflow-hidden shrink-0 shadow-inner">
              <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-10 h-full text-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center">-</button>
              <span className="font-bold text-base text-white">{quantity}</span>
              <button onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)} className="w-10 h-full text-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center">+</button>
            </div>

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

          <div className="border-t border-slate-800/60 pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Ürün Açıklaması</h3>
            <p className="text-slate-300 text-base leading-relaxed font-medium">
              {product.description || "Bu ürün hakkında henüz detaylı bir açıklama girilmemiştir."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}