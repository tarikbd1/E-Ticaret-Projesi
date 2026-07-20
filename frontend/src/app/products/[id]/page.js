'use client';
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params); 
  const id = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // 📸 YENİ: Ana ekranda gösterilecek aktif resim state'i
  const [mainImage, setMainImage] = useState(null);

  // ❤️ FAVORİ STATE'LERİ
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        if (data.success) {
          setProduct(data.data);
          
          // İlk yüklemede ana resmi belirle (images dizisi varsa ilkini, yoksa tekli resmi al)
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

  // Favori kontrolü
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
      } catch (error) {
        // Sessizce geç
      }
    };

    checkFavoriteStatus();
  }, [id]);

  // Favoriye ekleme / çıkarma
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
        const { data } = await axios.delete(
          `http://localhost:5000/api/auth/favorite/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          setIsFavorite(false);
          toast.success('Ürün favorilerden çıkarıldı!');
        }
      } else {
        const { data } = await axios.post(
          `http://localhost:5000/api/auth/favorite/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          setIsFavorite(true);
          toast.success('Ürün favorilere eklendi!');
        }
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

  if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold">Yükleniyor...</div>;
  if (!product) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-bold">Ürün bulunamadı.</div>;

  // 📸 YENİ: Tüm resimleri bir dizide topluyoruz. Veritabanından array (images) veya string (image) gelmesine göre kendini ayarlar.
  const allImages = product.images?.length > 0 
    ? product.images 
    : (product.image || product.imageUrl ? [product.image || product.imageUrl] : []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-[70px] pb-20">
      <ToastContainer theme="dark" />
      
      {/* ÜST BAR: Geri Dön Butonu */}
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

      {/* ANA İÇERİK: İkiye Bölünmüş Düzen */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ================= SOL TARAF: FOTOĞRAF GALERİSİ ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* ANA BÜYÜK FOTOĞRAF */}
          <div className="bg-[#050B14] aspect-square rounded-[2rem] flex items-center justify-center relative p-4 sm:p-8 border border-slate-800/50 shadow-[0_0_40px_-15px_rgba(99,102,241,0.15)] group overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-60"></div>

            {/* Favori Butonu */}
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              className={`absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                isFavorite 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {mainImage ? (
              <img 
                key={mainImage} // Key eklemek resim değiştiğinde animasyonun tetiklenmesini sağlar
                src={mainImage} 
                alt={product.name} 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500" 
              />
            ) : (
              <span className="text-9xl drop-shadow-2xl z-10 opacity-80">📦</span>
            )}
          </div>

          {/* 📸 KÜÇÜK FOTOĞRAFLAR (THUMBNAILS) */}
          {allImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, index) => (
                <div 
                  key={index} 
                  onClick={() => setMainImage(img)}
                  className={`aspect-square rounded-xl flex items-center justify-center border cursor-pointer transition-all overflow-hidden bg-[#050B14] ${
                    mainImage === img 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 opacity-100' 
                      : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} - Görsel ${index + 1}`} />
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
            
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-28 h-[50px] overflow-hidden shrink-0">
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

            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`hidden sm:flex h-[50px] w-[50px] rounded-xl border items-center justify-center transition-all active:scale-90 shrink-0 ${
                isFavorite 
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

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