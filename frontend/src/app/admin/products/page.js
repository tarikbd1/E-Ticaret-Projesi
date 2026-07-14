'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false); 

  // 📝 DÜZENLEME MODALI STATE'LERİ (Resim ve Açıklama eklendi)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState({
    _id: '',
    name: '',
    price: '',
    stock: '',
    description: '',
    image: ''
  });

  // 🛡️ GÜVENLİK BEKÇİSİ VE İLK VERİ ÇEKME
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const userData = localStorage.getItem('user');
        
        if (!userData) {
          toast.error('Lütfen önce giriş yapın!');
          router.push('/');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          toast.error('Bu sayfaya erişim yetkiniz yok!');
          router.push('/');
          return;
        }

        setIsAuthorized(true);
        await fetchProducts();
      } catch (error) {
        console.error("Yetkilendirme hatası:", error);
        router.push('/');
      }
    };

    checkAdminAndFetch();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      toast.error('Ürünler sunucudan çekilemedi!');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ ÜRÜN SİLME İŞLEMİ
  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Ürün başarıyla silindi!');
        setProducts(products.filter(product => product._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ürün silinirken bir hata oluştu.');
    }
  };

  // 📝 MODALI AÇ VE VERİLERİ DOLDUR (Resim ve Açıklama dahil)
  const handleEditClick = (product) => {
    setEditingProduct({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock ?? product.quantity ?? 0,
      description: product.description || '',
      image: product.image || product.imageUrl || '' // Backend'den hangisi geliyorsa
    });
    setIsModalOpen(true);
  };

  // 🚀 GÜNCELLEMEYİ SUNUCUYA GÖNDER
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const token = localStorage.getItem('token'); 

      const response = await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`, 
        {
          name: editingProduct.name,
          price: Number(editingProduct.price),
          stock: Number(editingProduct.stock),
          description: editingProduct.description, // Yeni eklenen
          image: editingProduct.image // Yeni eklenen
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Ürün başarıyla güncellendi!');
        setProducts(products.map(p => p._id === editingProduct._id ? response.data.data : p));
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ürün güncellenirken bir hata oluştu.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (!isAuthorized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <ToastContainer position="top-right" theme="dark" />
      
      {/* ÜST BAŞLIK VE EKLE BUTONU */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Ürün Yönetimi</h1>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition-colors text-sm"
        >
          + Yeni Ürün Ekle
        </Link>
      </div>

      {/* ÜRÜNLER TABLOSU */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-bold">GÖRSEL</th>
                <th className="p-4 font-bold">ÜRÜN ADI</th>
                <th className="p-4 font-bold">FİYAT</th>
                <th className="p-4 font-bold">STOK</th>
                <th className="p-4 text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Sistemde kayıtlı ürün bulunmuyor.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const imgSrc = product.image || product.imageUrl;
                  return (
                    <tr key={product._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden border border-slate-800">
                          {imgSrc ? (
                            <img src={imgSrc} alt="ürün" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-200 text-sm">
                        {product.name}
                      </td>
                      <td className="p-4 text-slate-300 text-sm">
                        {product.price.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                          {product.stock ?? product.quantity ?? 0}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-3 text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        > 
                          Düzenle
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 DÜZENLEME MODALI (GELİŞTİRİLMİŞ) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white">Ürünü Düzenle</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 font-bold transition text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Ürün Adı */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ürün Adı</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Fiyat ve Stok */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fiyat (TL)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stok Adedi</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Resim URL */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Resim URL (Link)</label>
                <input
                  type="text"
                  placeholder="https://ornek.com/resim.png"
                  value={editingProduct.image ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Ürün Açıklaması */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ürün Açıklaması</label>
                <textarea
                  rows="3"
                  placeholder="Ürünün detaylarını buraya yazın..."
                  value={editingProduct.description ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                ></textarea>
              </div>

              {/* Butonlar */}
              <div className="flex gap-3 pt-4 mt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 text-slate-400 border border-slate-700 font-bold rounded-xl hover:bg-slate-800 transition text-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className={`w-1/2 py-3 text-white font-bold rounded-xl shadow-lg transition text-sm ${
                    updateLoading ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {updateLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}