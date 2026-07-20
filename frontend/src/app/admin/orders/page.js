'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      toast.error('Siparişler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success('Sipariş durumu güncellendi!');
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu.');
    }
  };

  // 🚀 SİPARİŞ SİLME MOTORU
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bu siparişi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/orders/${orderId}`);

      if (response.data.success) {
        toast.success('Sipariş başarıyla silindi!');
        // Silinen siparişi ekrandan anında (sayfayı yenilemeden) kaldırıyoruz
        setOrders(orders.filter(order => order._id !== orderId));
      }
    } catch (error) {
      toast.error('Sipariş silinirken bir hata oluştu.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Bekliyor': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Hazırlanıyor': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Kargolandı': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Teslim Edildi': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'İptal Edildi': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Sipariş Yönetimi</h1>
          <p className="text-sm text-slate-400 mt-1">Gelen siparişlerin kargo ve hazırlık durumlarını buradan yönetin.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
          <span className="text-indigo-400 font-bold text-sm">Toplam Sipariş: {orders.length}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-bold">Müşteri</th>
                <th className="p-4 font-bold">Tutar</th>
                <th className="p-4 font-bold">Tarih</th>
                <th className="p-4 font-bold">Durum</th>
                <th className="p-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Sistemde henüz bir sipariş bulunmuyor. Vitrin aktif edildiğinde siparişler buraya düşecektir.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-200 text-sm">{order.user?.name || 'Bilinmiyor'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.user?.email || '-'}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-300">
                      {order.totalAmount} TL
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* Flex kapsayıcı: Seçim kutusu ve sil butonunu yan yana dizer */}
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Bekliyor">Bekliyor</option>
                          <option value="Hazırlanıyor">Hazırlanıyor</option>
                          <option value="Kargolandı">Kargolandı</option>
                          <option value="Teslim Edildi">Teslim Edildi</option>
                          <option value="İptal Edildi">İptal Edildi</option>
                        </select>

                        {/* SİLME BUTONU */}
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Siparişi Sil"
                          className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/20 active:scale-95"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}