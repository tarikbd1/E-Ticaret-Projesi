'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SupportPage() {
  const router = useRouter();
  
  // 🚀 EKRAN DURUMLARI: 'check' (yükleniyor), 'authChoice' (seçim ekranı), 'guestLogin' (misafir formu), 'support' (ana bilet ekranı)
  const [viewState, setViewState] = useState('check');
  
  // 🚀 KULLANICI STATE'LERİ
  const [userAuth, setUserAuth] = useState(null);
  const [guestAuth, setGuestAuth] = useState(null); // Misafir oturumu
  
  // TİCKET STATE'LERİ
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('new');

  // 🛡️ SİSTEME GİRİŞ KONTROLÜ
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const guestData = sessionStorage.getItem('guestUser'); // Tarayıcı kapanınca silinen geçici hafıza

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserAuth(parsedUser);
      setFormData(prev => ({ ...prev, name: parsedUser.name, email: parsedUser.email }));
      fetchMyTickets(parsedUser.email);
      setViewState('support');
    } else if (guestData) {
      const parsedGuest = JSON.parse(guestData);
      setGuestAuth(parsedGuest);
      setFormData(prev => ({ ...prev, name: parsedGuest.name, email: parsedGuest.email }));
      fetchMyTickets(parsedGuest.email);
      setViewState('support');
    } else {
      setViewState('authChoice'); // Kimse yoksa seçim ekranını göster
    }
  }, []);

  const fetchMyTickets = async (userEmail) => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets');
      const data = await response.json();
      if (data.success) {
        const userTickets = data.data.filter(t => t.email === userEmail);
        setMyTickets(userTickets);
      }
    } catch (error) {
      console.error('Biletler çekilemedi', error);
    }
  };

  // 📝 MİSAFİR GİRİŞİNİ BAŞLAT
  const handleGuestLogin = (e) => {
    e.preventDefault();
    const guestInfo = { name: formData.name, email: formData.email };
    sessionStorage.setItem('guestUser', JSON.stringify(guestInfo));
    setGuestAuth(guestInfo);
    setViewState('support');
    fetchMyTickets(guestInfo.email);
    toast.success('Misafir oturumu başlatıldı!');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 TİCKET GÖNDERME MOTORU
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 💡 MÜHENDİSLİK DETAYI: Misafirse isminin sonuna [Misafir] ekle ki admin anlasın!
      const finalName = guestAuth ? `${formData.name} [Misafir]` : formData.name;

      const payload = {
        name: finalName,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      };

      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Destek talebiniz başarıyla alındı!');
        
        // Mesajı temizle, name ve email kilitli kalsın
        setFormData(prev => ({ ...prev, subject: '', message: '' })); 
        setMyTickets([data.data, ...myTickets]);
        setActiveTab('past');
      } else {
        toast.error(data.message || 'Bir hata oluştu.');
      }
    } catch (error) {
      toast.error('Sunucuyla bağlantı kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  // 🎨 ROZET RENKLERİ
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Açık': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'İnceleniyor': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Cevaplandı': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Kapatıldı': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // 1️⃣ YÜKLENİYOR EKRANI
  if (viewState === 'check') {
    return (
      <div className="min-h-[calc(100vh-69px)] bg-slate-950 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2️⃣ SEÇİM EKRANI (Giriş Yap vs Misafir)
  if (viewState === 'authChoice') {
    return (
      <div className="min-h-[calc(100vh-69px)] bg-slate-950 py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-black text-white mb-4">Destek Merkezi</h1>
          <p className="text-slate-400 text-lg">Size nasıl yardımcı olabiliriz? Lütfen devam etmek için bir yöntem seçin.</p>
        </div>

        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Kayıtlı Üye Kartı */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl hover:border-indigo-500/50 transition-all group">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl">👑</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Kayıtlı Müşteriyim</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Taleplerinizi kalıcı olarak takip etmek ve siparişlerinizle eşleştirmek için hesabınıza giriş yapın.
            </p>
            <button onClick={() => router.push('/login')} className="mt-auto w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95">
              Giriş Yap
            </button>
          </div>

          {/* Misafir Kartı */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl hover:border-slate-600 transition-all group">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl">👤</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Misafir Kullanıcı</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Üye olmadan hızlıca destek talebi oluşturun. (Talepleriniz sadece bu oturum boyunca takip edilebilir.)
            </p>
            <button onClick={() => setViewState('guestLogin')} className="mt-auto w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all active:scale-95 border border-slate-700">
              Misafir Olarak Devam Et
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 3️⃣ MİSAFİR BİLGİ GİRİŞ FORMU
  if (viewState === 'guestLogin') {
    return (
      <div className="min-h-[calc(100vh-69px)] bg-slate-950 py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
            <button onClick={() => setViewState('authChoice')} className="text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-xl font-bold text-white">Misafir Bilgileri</h2>
          </div>
          
          <form onSubmit={handleGuestLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Adınız Soyadınız</label>
              <input type="text" name="name" required onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500" placeholder="Ahmet Yılmaz" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-Posta Adresiniz</label>
              <input type="email" name="email" required onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500" placeholder="ornek@mail.com" />
            </div>
            <button type="submit" className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
              Destek Talebine Geç
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4️⃣ ANA DESTEK EKRANI (Senin Tasarım)
  return (
    <div className="min-h-[calc(100vh-69px)] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <ToastContainer position="top-right" theme="dark" />
      
      {/* 💡 MİSAFİR UYARISI */}
      {guestAuth && (
        <div className="max-w-4xl w-full mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-xl">👤</span>
            <p className="text-sm text-amber-200/90 font-medium">
              Şu an <span className="font-bold text-amber-400">Misafir</span> olarak işlem yapıyorsunuz. Sayfayı kapatırsanız geçmiş taleplerinizi göremezsiniz.
            </p>
          </div>
          <button onClick={() => { sessionStorage.removeItem('guestUser'); window.location.reload(); }} className="text-xs font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-500/30">
            Çıkış Yap
          </button>
        </div>
      )}

      {/* SEKME (TAB) MENÜSÜ */}
      <div className="max-w-4xl w-full flex justify-center mb-10">
        <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex gap-2 shadow-lg backdrop-blur-sm">
          <button onClick={() => setActiveTab('new')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'new' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            📝 Yeni Talep Oluştur
          </button>
          <button onClick={() => setActiveTab('past')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'past' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            📂 Geçmiş Taleplerim {myTickets.length > 0 && <span className="ml-2 bg-slate-950/50 px-2 py-0.5 rounded-md">{myTickets.length}</span>}
          </button>
        </div>
      </div>

      {/* YENİ TALEP OLUŞTURMA */}
      {activeTab === 'new' && (
        <div className="max-w-4xl w-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-5">
            
            <div className="bg-indigo-600 p-8 md:col-span-2 flex flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div>
                <h2 className="text-2xl font-extrabold mb-2">Bize Ulaşın</h2>
                <p className="text-indigo-200 text-sm mb-8 leading-relaxed">
                  Siparişlerinizle ilgili bir sorun mu var veya sormak istediğiniz bir şey mi bulunuyor? Formu doldurun, size hemen yardımcı olalım.
                </p>
              </div>
              <div className="space-y-6 text-sm">
                <div className="flex items-center gap-4"><span className="p-2 bg-indigo-500/50 rounded-lg">📧</span><span>destek@eticaret.com</span></div>
                <div className="flex items-center gap-4"><span className="p-2 bg-indigo-500/50 rounded-lg">📞</span><span>+90 (850) 123 45 67</span></div>
                <div className="flex items-center gap-4"><span className="p-2 bg-indigo-500/50 rounded-lg">📍</span><span>Teknoloji Vadisi, İstanbul</span></div>
              </div>
            </div>

            <div className="p-8 md:col-span-3 bg-slate-900">
              <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Destek Talebi Oluştur</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Adınız Soyadınız</label>
                  <input type="text" value={formData.name} disabled className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-Posta Adresiniz</label>
                  <input type="email" value={formData.email} disabled className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Konu</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Örn: İade süreci hakkında" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mesajınız</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows="4" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none custom-scrollbar" placeholder="Lütfen sorununuzu detaylıca açıklayın..."></textarea>
                </div>
                <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]'}`}>
                  {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
                </button>
              </form>
            </div>
            
          </div>
        </div>
      )}

      {/* GEÇMİŞ TALEPLERİM */}
      {activeTab === 'past' && (
        <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {myTickets.length === 0 ? (
             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
               <span className="text-6xl mb-4 opacity-30 block">📂</span>
               <h3 className="text-xl font-bold text-white mb-2">Talep Bulunamadı</h3>
               <p className="text-slate-400 text-sm">Henüz oluşturduğunuz bir destek talebi bulunmuyor.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myTickets.map(ticket => (
                <div key={ticket._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-white line-clamp-1">{ticket.subject}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{new Date(ticket.createdAt).toLocaleString('tr-TR')}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border shrink-0 ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 mb-4">
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{ticket.message}</p>
                    </div>
                  </div>

                  {ticket.reply ? (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 relative mt-auto">
                      <div className="absolute -top-2.5 left-4 bg-slate-900 px-2 text-[9px] font-black text-indigo-400 uppercase border border-indigo-500/20 rounded-md">Yetkili Yanıtı</div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-lg">💬</span>
                        <p className="text-sm text-indigo-100 leading-relaxed font-medium">{ticket.reply}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 flex items-center justify-center border-t border-slate-800/60">
                      <span className="text-xs text-slate-500 italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse"></span>Yetkili yanıtı bekleniyor...
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}