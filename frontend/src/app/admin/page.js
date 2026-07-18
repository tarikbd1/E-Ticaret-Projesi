'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  
  // YENİ: Sipariş istatistiklerini tutacak state
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalItemsSold: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // İki isteği aynı anda (paralel) gönderiyoruz ki sayfa hızlı yüklensin
        const [ticketRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tickets'),
          axios.get('http://localhost:5000/api/orders/stats') // Yeni bağladığımız kablo!
        ]);
        
        // 1. Destek Taleplerini Ayarla
        if (ticketRes.data.success) {
          const openCount = ticketRes.data.data.filter(ticket => ticket.status === 'Açık').length;
          setOpenTicketsCount(openCount);
        }

        // 2. Sipariş İstatistiklerini Ayarla
        if (statsRes.data.success) {
          setOrderStats({
            totalOrders: statsRes.data.data.totalOrders,
            totalItemsSold: statsRes.data.data.totalItemsSold
          });
        }

      } catch (error) {
        console.error('İstatistikler çekilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-100">Gösterge Paneli</h1>
        <p className="text-sm text-slate-400 mt-1">Sisteminizin genel durumunu buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* KART 1: Toplam Sipariş (CANLI VERİ) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Toplam Sipariş</p>
            {/* Sabit 0 yerine state'den gelen canlı veriyi bastık */}
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-emerald-400 transition-colors">
              {orderStats.totalOrders}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl">
            📦
          </div>
        </div>

        {/* KART 2: Toplam Ürün (CANLI VERİ) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-blue-500/30 transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Toplam Ürün</p>
            {/* Sabit 0 yerine state'den gelen canlı veriyi bastık */}
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-blue-400 transition-colors">
              {orderStats.totalItemsSold}
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 text-2xl">
            🛍️
          </div>
        </div>

        {/* KART 3: Açık Destek Talepleri (CANLI VERİ) */}
        <Link href="/admin/tickets" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-rose-500/30 transition-colors cursor-pointer">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Açık Destek Talebi</p>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-rose-400 transition-colors">
              {openTicketsCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 text-2xl">
            🎧
          </div>
        </Link>

      </div>

      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-indigo-400 mb-2">Hoş Geldin, Yönetici!</h3>
        <p className="text-sm text-slate-300">
          Sol taraftaki menüyü kullanarak mağazanızdaki ürünleri güncelleyebilir, gelen siparişlerin kargo durumlarını ayarlayabilir ve müşterilerden gelen destek taleplerini (ticket) yanıtlayabilirsiniz.
        </p>
      </div>

    </div>
  );
}