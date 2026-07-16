'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'; // 🚀 1. Yönlendirme motorunu import ettik

export default function AdminTicketsPage() {
  const router = useRouter(); // 🚀 2. Motoru çalıştırdık
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde ticketları backend'den çekiyoruz
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets');
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      toast.error('Destek talepleri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  // Ticket durumunu güncelleyen fonksiyon
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success('Talep durumu güncellendi!');
        // Ekrandaki listeyi anında güncelliyoruz
        setTickets(tickets.map(ticket => 
          ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
      }
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu.');
    }
  };

  // Duruma göre renk belirleme ufak bir estetik dokunuş
  const getStatusColor = (status) => {
    switch (status) {
      case 'Açık': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'İnceleniyor': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Kapatıldı': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
          <h1 className="text-2xl font-extrabold text-slate-100">Destek Talepleri (Tickets)</h1>
          <p className="text-sm text-slate-400 mt-1">Müşterilerden gelen sorunları ve talepleri yönetin.</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
          <span className="text-indigo-400 font-bold text-sm">Toplam Talep: {tickets.length}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-bold">Müşteri Bilgisi</th>
                <th className="p-4 font-bold">Konu / Mesaj</th>
                <th className="p-4 font-bold">Tarih</th>
                <th className="p-4 font-bold">Durum</th>
                <th className="p-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Henüz hiçbir destek talebi bulunmuyor.</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  // 🚀 3. Satırı tıklanabilir yaptık ve yönlendirme ekledik
                  <tr 
                    key={ticket._id} 
                    onClick={() => router.push('/admin/support')}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">{ticket.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{ticket.email}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-300 text-sm truncate">{ticket.subject}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{ticket.message}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* 🚀 4. ÇAKISMA ÖNLEYİCİ: Select'e tıklayınca satırın yönlendirmesini durdurur */}
                      <select 
                        value={ticket.status}
                        onClick={(e) => e.stopPropagation()} 
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer relative z-10"
                      >
                        <option value="Açık">Açık Yap</option>
                        <option value="İnceleniyor">İnceleniyor Yap</option>
                        <option value="Kapatıldı">Kapatıldı Yap</option>
                      </select>
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