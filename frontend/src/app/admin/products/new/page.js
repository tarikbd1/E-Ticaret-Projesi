'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    stock: ''
  });

  const [categories, setCategories] = useState([]); 
  const [categorySelect, setCategorySelect] = useState('');

  const [extraImages, setExtraImages] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Kategoriler çekilemedi');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExtraImageChange = (index, value) => {
    const updated = [...extraImages];
    updated[index] = value;
    setExtraImages(updated);
  };

  const addExtraImageField = () => {
    setExtraImages([...extraImages, '']);
  };

  const removeExtraImageField = (index) => {
    setExtraImages(extraImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!categorySelect) {
      setError('Lütfen bir kategori seçin!');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token'); 
    const cleanedImages = extraImages.map((url) => url.trim()).filter((url) => url !== '');

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
          category: categorySelect, 
          images: cleanedImages
        })
      });

      const data = await res.json();

      if (data.success) {
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
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link href="/admin/products" className="flex items-center gap-1.5 text-slate-400 hover:text-white mr-4 transition-colors">
          <ArrowLeft size={18} strokeWidth={2.5} /> Geri
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

        {/* Kategori seçimi: sadece açılır liste, ayrı link yok */}
        <div>
          <label className="block text-slate-300 mb-2 font-medium">Kategori</label>
          <div className="relative">
            <select
              required
              value={categorySelect}
              onChange={(e) => setCategorySelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="" disabled>Kategori seçin...</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
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
          <label className="block text-slate-300 mb-2 font-medium">Ana Görsel URL (Kapak Resmi)</label>
          <input 
            type="text" name="image" required value={formData.image} onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
            placeholder="https://site.com/resim.jpg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300 font-medium">Ek Galeri Görselleri (Opsiyonel)</label>
            <button
              type="button"
              onClick={addExtraImageField}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Resim Ekle
            </button>
          </div>

          <div className="space-y-3">
            {extraImages.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleExtraImageChange(index, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder={`https://site.com/resim-${index + 2}.jpg`}
                />
                {extraImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExtraImageField(index)}
                    className="px-3 bg-slate-950 border border-slate-800 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors flex items-center justify-center"
                    title="Bu görseli kaldır"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>
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