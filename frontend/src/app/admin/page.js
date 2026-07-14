'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Ticketları backend'den çekiyoruz
        const ticketRes = await axios.get('http://localhost:5000/api/tickets');
        
        if (ticketRes.data.success) {
          // Sadece durumu "Açık" olanları filtreleyip sayısını alıyoruz
          const openCount = ticketRes.data.data.filter(ticket => ticket.status === 'Açık').length;
          setOpenTicketsCount(openCount);
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

      {/* İSTATİSTİK KARTLARI (Dokümandaki gereksinimlere göre hazırlandı) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* KART 1: Toplam Sipariş */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Toplam Sipariş</p>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-emerald-400 transition-colors">0</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl">
            📦
          </div>
        </div>

        {/* KART 2: Toplam Ürün */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between group hover:border-blue-500/30 transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Toplam Ürün</p>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-blue-400 transition-colors">0</h3>
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

      {/* ALT BİLGİ VEYA HIZLI ERİŞİM ALANI */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-indigo-400 mb-2">Hoş Geldin, Yönetici!</h3>
        <p className="text-sm text-slate-300">
          Sol taraftaki menüyü kullanarak mağazanızdaki ürünleri güncelleyebilir, gelen siparişlerin kargo durumlarını ayarlayabilir ve müşterilerden gelen destek taleplerini (ticket) yanıtlayabilirsiniz.
        </p>
      </div>

    </div>
  );
}