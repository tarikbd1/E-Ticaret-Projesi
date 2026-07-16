'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        // Backend'de henüz oluşturmadıysak bir "my-orders" rotası gerekecek
        const response = await axios.get(`http://localhost:5000/api/orders/my-orders/${user._id}`);
        setOrders(response.data.data);
      } catch (error) {
        console.error("Siparişler yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="text-slate-400">Siparişler yükleniyor...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Sipariş Geçmişim</h2>
      {orders.length === 0 ? <p>Henüz siparişiniz bulunmuyor.</p> : (
        orders.map(order => (
          <div key={order._id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-indigo-400 font-bold">#{order._id.slice(-6)}</span>
              <span className="bg-slate-800 px-3 py-1 rounded-full text-xs">{order.status}</span>
            </div>
            <p className="text-sm text-slate-400">Tutar: {order.totalAmount} TL</p>
            <p className="text-xs text-slate-500 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
}