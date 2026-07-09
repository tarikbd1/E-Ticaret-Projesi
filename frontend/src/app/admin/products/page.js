"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ürünleri Backend'den Çekme
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Ürünler çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Silme İşlemi İçin Taslak Fonksiyon (Backend'e bağlayacağız)
  const deleteHandler = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        // Tarayıcıdaki token'ı alıyoruz
        const token = localStorage.getItem('token');
        
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (data.success) {
          // Başarılıysa, silinen ürünü ekrandan (state'den) anında uçur
          setProducts(products.filter((product) => product._id !== id));
          // Eğer react-toastify eklediysen buraya toast.success('Ürün silindi') yazabilirsin.
          alert('Ürün başarıyla silindi!');
        } else {
          alert(data.message || 'Ürün silinemedi.');
        }
      } catch (error) {
        console.error("Silme işlemi sırasında hata:", error);
        alert('Sunucuyla bağlantı kurulamadı.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Ürün Yönetimi</h1>
        <Link 
            href="/admin/products/new" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
            + Yeni Ürün Ekle
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-400">Ürünler yükleniyor...</div>
      ) : (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">ÜRÜN ADI</th>
                <th className="p-4">FİYAT</th>
                <th className="p-4">STOK</th>
                <th className="p-4 text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 text-sm text-slate-500">{product._id.substring(0, 8)}...</td>
                  <td className="p-4 font-medium text-white">{product.name}</td>
                  <td className="p-4">{product.price.toLocaleString('tr-TR')} TL</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">
                      Düzenle
                    </button>
                    <button 
                      onClick={() => deleteHandler(product._id)}
                      className="text-rose-400 hover:text-rose-300 font-medium text-sm"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Sistemde kayıtlı ürün bulunmamaktadır.
            </div>
          )}
        </div>
      )}
    </div>
  );
}