'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NewProductPage() {
  const router = useRouter();
  
  // Ana form state'i
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '', // Ana kapak resmi
    stock: ''
  });

  // 📸 YENİ: Ekstra resimler için dinamik dizi state'i
  const [extraImages, setExtraImages] = useState([]); 
  
  const [loading, setLoading] = useState(false);

  // Form elemanları değiştikçe state'i günceller
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Dinamik resim inputlarını yönetme fonksiyonları
  const handleAddExtraImage = () => {
    setExtraImages([...extraImages, '']);
  };

  const handleRemoveExtraImage = (index) => {
    const newImages = [...extraImages];
    newImages.splice(index, 1);
    setExtraImages(newImages);
  };

  const handleExtraImageChange = (index, value) => {
    const newImages = [...extraImages];
    newImages[index] = value;
    setExtraImages(newImages);
  };

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token'); 
    if (!token) {
      toast.error('Yetkisiz işlem: Admin token bulunamadı!');
      setLoading(false);
      return;
    }

    // Boş girilen ekstra resim linklerini filtrele
    const filteredExtraImages = extraImages.filter(img => img.trim() !== '');

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          images: filteredExtraImages // Ekstra resimleri dizi olarak gönderiyoruz
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Ürün başarıyla eklendi! Yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh(); 
        }, 1500);
      } else {
        toast.error(data.message || 'Ürün eklenirken bir hata oluştu.');
      }
    } catch (err) {
      toast.error('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-10 px-4 sm:px-8">
      <ToastContainer theme="dark" />
      
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8 gap-4">
          <Link 
            href="/admin/products" 
            className="group flex items-center justify-center w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Yeni Ürün Ekle</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#050B14] border border-slate-800/60 p-6 sm:p-10 rounded-[2rem] shadow-2xl space-y-8">
          
          {/* Ürün Adı & Kategori Alanı (Gelecek için grid yapısı) */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Ürün Adı</label>
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Örn: Asus TUF A15 Gaming Laptop"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Açıklama</label>
            <textarea 
              name="description" required rows="4" value={formData.description} onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              placeholder="Ürünün tüm detaylarını ve özelliklerini buraya girin..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Fiyat (TL)</label>
              <div className="relative">
                <input 
                  type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 pl-12 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₺</span>
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Stok Adedi</label>
              <input 
                type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Görsel Yönetimi
            </h3>
            
            {/* Ana Görsel (Kapak) */}
            <div className="mb-6">
              <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">
                Ana Kapak Görseli (Zorunlu)
              </label>
              <input 
                type="text" name="image" required value={formData.image} onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="https://site.com/ana-resim.jpg"
              />
            </div>

            {/* Ekstra Görseller */}
            <div className="space-y-4">
              <label className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">
                Ekstra Görseller (Opsiyonel)
              </label>
              
              {extraImages.map((img, index) => (
                <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <input 
                    type="text" 
                    value={img} 
                    onChange={(e) => handleExtraImageChange(index, e.target.value)}
                    className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder={`Ekstra görsel linki ${index + 1}`}
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveExtraImage(index)}
                    className="w-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                    title="Bu görseli sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddExtraImage}
                className="w-full py-4 border-2 border-dashed border-slate-700 text-slate-400 rounded-xl font-bold hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Yeni Görsel Alanı Ekle
              </button>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className={`w-full mt-8 h-14 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
              loading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                Ürün Ekleniyor...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Ürünü Kaydet ve Yayınla
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}