'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Yeni kategori ekleme state'i
  const [newCategory, setNewCategory] = useState('');
  
  // Düzenleme state'i
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Kategorileri Backend'den Çekme
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      toast.error('Kategoriler getirilemedi!');
    } finally {
      setLoading(false);
    }
  };

  // Yeni Kategori Ekleme
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Kategori eklendi!');
        setNewCategory('');
        fetchCategories();
      } else {
        toast.error(data.message || 'Hata oluştu!');
      }
    } catch (err) {
      toast.error('Sunucu hatası!');
    }
  };

  //  Kategori Silme
  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Kategori silindi!');
        fetchCategories();
      } else {
        toast.error(data.message || 'Silinemedi!');
      }
    } catch (err) {
      toast.error('Sunucu hatası!');
    }
  };

  //  Kategori Güncelleme
  const handleUpdate = async (id) => {
    if (!editName.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName.trim() })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Kategori güncellendi!');
        setEditingId(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Güncellenemedi!');
      }
    } catch (err) {
      toast.error('Sunucu hatası!');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-10 px-4 sm:px-8">
      <ToastContainer theme="dark" />
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center mb-8 gap-4">
          <Link href="/admin/products" className="group flex items-center justify-center w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Kategori Yönetimi</h1>
        </div>

        {/* Yeni Ekleme Formu */}
        <form onSubmit={handleAddCategory} className="bg-[#050B14] border border-slate-800/60 p-6 rounded-2xl mb-8 flex gap-4 shadow-xl">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Yeni kategori adı girin..."
            className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button type="submit" className="px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">
            Ekle
          </button>
        </form>

        {/* Kategoriler Listesi */}
        <div className="bg-[#050B14] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Yükleniyor...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Henüz hiç kategori eklenmemiş.</div>
          ) : (
            <ul className="divide-y divide-slate-800/60">
              {categories.map((cat) => (
                <li key={cat._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-900/30 transition-colors">
                  
                  {/* Sol Taraf: İsim veya Düzenleme Inputu */}
                  <div className="flex-1">
                    {editingId === cat._id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full sm:w-1/2 bg-slate-950 border border-indigo-500 rounded-lg p-2 text-white focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-lg font-bold text-slate-300">{cat.name}</span>
                    )}
                  </div>

                  {/* Sağ Taraf: Aksiyon Butonları */}
                  <div className="flex items-center gap-2">
                    {editingId === cat._id ? (
                      <>
                        <button onClick={() => handleUpdate(cat._id)} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg font-bold transition-all">Kaydet</button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all">İptal</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(cat._id); setEditName(cat.name); }} className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                          <Pencil size={16} strokeWidth={2} />
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}