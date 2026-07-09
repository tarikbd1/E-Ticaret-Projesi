"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form elemanları değiştikçe state'i günceller
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // DİKKAT: Arka plan bizden Admin Token'ı bekliyor.
    // Şimdilik tarayıcı hafızasından (localStorage) çekiyoruz.
    const token = localStorage.getItem('token'); 

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Güvenlik kapısından geçmek için
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock)
        })
      });

      const data = await res.json();

      if (data.success) {
        // Başarılıysa ürünler tablosuna geri dön
        router.push('/admin/products');
        router.refresh(); 
      } else {
        setError(data.message || 'Ürün eklenirken bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/admin/products" className="text-slate-400 hover:text-white mr-4">
          ← Geri
        </Link>
        <h1 className="text-3xl font-bold text-white">Yeni Ürün Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-xl space-y-6">
        
        {error && <div className="bg-rose-500/10 text-rose-400 p-4 rounded-lg border border-rose-500/20">{error}</div>}

        <div>
          <label className="block text-slate-300 mb-2 font-medium">Ürün Adı</label>
          <input 
            type="text" name="name" required value={formData.name} onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
            placeholder="Örn: Mekanik Klavye"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-medium">Açıklama</label>
          <textarea 
            name="description" required rows="4" value={formData.description} onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
            placeholder="Ürün detaylarını girin..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 mb-2 font-medium">Fiyat (TL)</label>
            <input 
              type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2 font-medium">Stok Adedi</label>
            <input 
              type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-2 font-medium">Görsel URL (Şimdilik Link)</label>
          <input 
            type="text" name="image" required value={formData.image} onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
            placeholder="https://site.com/resim.jpg"
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Ekleniyor...' : 'Ürünü Kaydet'}
        </button>

      </form>
    </div>
  );
}