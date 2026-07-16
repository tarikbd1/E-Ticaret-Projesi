'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 📝 YANITLAMA MODALI STATE'LERİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // 🛡️ GÜVENLİK BEKÇİSİ VE VERİ ÇEKME
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
        await fetchTickets();
      } catch (error) {
        console.error("Yetkilendirme hatası:", error);
        router.push('/');
      }
    };
    checkAdminAndFetch();
  }, [router]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setTickets(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTickets(response.data);
      }
    } catch (error) {
      toast.error('Destek talepleri sunucudan çekilemedi!');
    } finally {
      setLoading(false);
    }
  };

  // 📝 YANITLAMA MODALINI AÇ
  const handleReplyClick = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.reply || '');
    setIsModalOpen(true);
  };

  // 🚀 YANITI SUNUCUYA GÖNDER (UPDATE)
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return toast.warning('Lütfen bir yanıt yazın!');
    
    setReplyLoading(true);

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.put(
        `http://localhost:5000/api/tickets/${selectedTicket._id}`, 
        {
          reply: replyText,
          status: 'Cevaplandı' // İstersen burayı da duruma göre değiştirebilirsin
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Yanıt başarıyla gönderildi!');
        setTickets(tickets.map(t => t._id === selectedTicket._id ? response.data.data : t));
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yanıt gönderilirken bir hata oluştu.');
    } finally {
      setReplyLoading(false);
    }
  };

  // 🗑️ TİCKET SİLME
  const handleDelete = async (id) => {
    if (!window.confirm('Bu destek talebini tamamen silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Talep silindi.');
      setTickets(tickets.filter(t => t._id !== id));
    } catch (error) {
      toast.error('Silme işlemi başarısız oldu.');
    }
  };

  // 🔥 DURUMA GÖRE RENK VEREN FONKSİYON (DİNAMİK)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Açık': 
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'İnceleniyor': 
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Cevaplandı': 
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Kapatıldı': 
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: 
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 pt-24">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800/80 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Destek Talepleri (Tickets)</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <th className="p-5">Müşteri</th>
                  <th className="p-5">Konu</th>
                  <th className="p-5">Durum</th>
                  <th className="p-5">Tarih</th>
                  <th className="p-5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-500 font-medium">Şu an hiç destek talebi bulunmuyor.</td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr 
                      key={ticket._id} 
                      onClick={() => handleReplyClick(ticket)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-5">
                        <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{ticket.name || 'Bilinmiyor'}</div>
                        <div className="text-xs text-slate-400">{ticket.email}</div>
                      </td>
                      <td className="p-5 font-medium text-slate-300 text-sm max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      
                      {/* 🚀 İŞTE BURASI DİNAMİK OLDU */}
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-md text-[11px] font-black tracking-widest uppercase border ${getStatusBadge(ticket.status)}`}>
                          {ticket.status || 'Bilinmiyor'}
                        </span>
                      </td>
                      
                      <td className="p-5 text-slate-400 text-xs font-medium">
                        {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-5 text-right space-x-3 text-sm font-bold">
                        <button className="text-indigo-400 hover:text-indigo-300 transition-colors"> 
                          {ticket.status === 'Cevaplandı' || ticket.status === 'Kapatıldı' ? 'Gör/Düzenle' : 'Yanıtla'}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ticket._id);
                          }}
                          className="text-rose-400 hover:text-rose-300 transition-colors relative z-10 px-2 py-1"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* YANITLAMA MODALI */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-700 overflow-hidden">
            
            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="text-xl font-black text-white">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Kimden: {selectedTicket.name} ({selectedTicket.email})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition text-2xl font-black">✕</button>
            </div>

            <div className="p-8 space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Müşterinin Mesajı</label>
                <div className="bg-[#050B14] border border-slate-800/80 rounded-2xl p-5 text-slate-300 text-sm leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                  {selectedTicket.message}
                </div>
              </div>

              <form onSubmit={handleReplySubmit}>
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Sizin Yanıtınız</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Müşteriye iletilecek çözüm veya cevabınızı buraya yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-700 rounded-2xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar transition-colors"
                ></textarea>

                <div className="flex gap-4 pt-4 mt-4 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 py-3.5 text-slate-400 bg-slate-900 border border-slate-700 font-bold rounded-xl hover:bg-slate-800 hover:text-white transition text-sm"
                  >
                    İptal Et
                  </button>
                  <button
                    type="submit"
                    disabled={replyLoading}
                    className={`w-2/3 py-3.5 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm ${
                      replyLoading ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25 active:scale-[0.98]'
                    }`}
                  >
                    {replyLoading ? 'Gönderiliyor...' : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Yanıtı Gönder
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}