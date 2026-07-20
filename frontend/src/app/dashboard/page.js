'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [detectedName, setDetectedName] = useState('Kullanıcı');
  const [userEmail, setUserEmail] = useState('Tanımlanmadı');
  const [loginCount, setLoginCount] = useState(18); 
  const [loading, setLoading] = useState(true);
  
  // ŞİFRE DEĞİŞTİRME STATE'LERİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 📍 ADRES YÖNETİMİ STATE'LERİ (Posta Kodu Eklendi)
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // 🚀 YENİ: null ise "ekle", dolu ise "düzenle" modu
  const [newAddress, setNewAddress] = useState({
    title: '',
    city: '',
    district: '',
    fullAddress: '',
    zipCode: '' // 🚀 YENİ: Posta Kodu eklendi
  });

  // ⏱️ CANLI İSTATİSTİK MOTORU STATE'LERİ
  const [sessionTime, setSessionTime] = useState(0);

  const router = useRouter();

  // 1. KRONOMETRE MOTORU (Aktif Seans Süresi)
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSessionTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + 's ' : ''}${mins > 0 ? mins + 'dk ' : ''}${secs}sn`;
  };

  // 2. PROFİL VE DİNAMİK SAYAÇ VERİLERİNİ ÇEKME MOTORU
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;

        if (data) {
          const userData = data.user || data;
          setUser(userData);
          
          if (data.addresses) {
            setAddresses(data.addresses);
          }

          const dynamicCount = data.loginCount !== undefined ? data.loginCount : (userData.loginCount !== undefined ? userData.loginCount : 18);
          setLoginCount(dynamicCount);

          const emailMatch = userData.email || userData.Email || data.email || data.Email;
          if (emailMatch) {
            setUserEmail(emailMatch);
          }

          const exactMatch = userData.name || userData.fullName || userData.username || userData.ad || userData.isim || userData.ad_soyad;
          if (exactMatch) {
            setDetectedName(exactMatch);
          }
        }
      } catch (err) {
        console.error('Profil yüklenirken hata oluştu:', err);
        localStorage.removeItem('token');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ŞİFRE DEĞİŞTİRME POST İŞLEMİ
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler birbiriyle uyuşmuyor!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }

    setPasswordLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        { oldPassword, newPassword },
        { 
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status >= 200 && status < 500
        }
      );

      if (response.status >= 400) {
        toast.error(response.data?.message || 'Şifre değiştirilirken bir hata oluştu!');
        setPasswordLoading(false);
        return;
      }

      toast.success('Şifreniz başarıyla değiştirildi!');
      setIsModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Sunucuyla bağlantı kurulamadı!');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 🚀 GÜNCELLENDİ: ADRES EKLEME / GÜNCELLEME POST-PUT İŞLEMİ
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    const token = localStorage.getItem('token');
    const isEditing = Boolean(editingAddressId);

    try {
      const response = isEditing
        ? await axios.put(
            `http://localhost:5000/api/auth/address/${editingAddressId}`,
            newAddress,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await axios.post(
            'http://localhost:5000/api/auth/address',
            newAddress,
            { headers: { Authorization: `Bearer ${token}` } }
          );

      if (response.data.success) {
        toast.success(isEditing ? 'Adres başarıyla güncellendi!' : 'Adres başarıyla eklendi!');
        setAddresses(response.data.addresses);
        closeAddressModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adres işlenirken bir hata oluştu!');
    } finally {
      setAddressLoading(false);
    }
  };

  // 🚀 YENİ: ADRES SİLME DELETE İŞLEMİ
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/auth/address/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Adres başarıyla silindi!');
        setAddresses(response.data.addresses); 
      }
    } catch (err) {
      toast.error('Adres silinirken bir hata oluştu!');
    }
  };

  // 🚀 YENİ: DÜZENLEME MODUNU BAŞLATMA
  const handleEditClick = (addr) => {
    setEditingAddressId(addr._id);
    setNewAddress({
      title: addr.title || '',
      city: addr.city || '',
      district: addr.district || '',
      fullAddress: addr.fullAddress || '',
      zipCode: addr.zipCode || ''
    });
    setIsAddressModalOpen(true);
  };

  // 🚀 YENİ: Modal kapatılırken formu ve düzenleme modunu sıfırlayan yardımcı fonksiyon
  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    setNewAddress({ title: '', city: '', district: '', fullAddress: '', zipCode: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400">Hesabınız yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-69px)] bg-slate-950 text-slate-100 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      <div className="w-full max-w-6xl mx-auto space-y-6">
        
        {/* ÜST BANNER */}
        <div className="w-full p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl shadow-2xl border border-indigo-500/20">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Hoş Geldin, {detectedName}! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Hesap ayarlarına ve sipariş detaylarına buradan ulaşabilirsin.</p>
        </div>

        {/* ANA İÇERİK ALANI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
          
          {/* SOL BÖLÜM: PROFİL PANELİ */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl h-full">
            <div className="space-y-5">
              
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-500/20">
                  {detectedName[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-200">{detectedName}</h2>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">Kayıtlı Müşteri</p>
                </div>
              </div>

              <div className="space-y-3 text-xs border-b border-slate-800/60 pb-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">E-Posta Adresi</label>
                  <p className="text-slate-300 font-medium mt-0.5 break-all">{userEmail}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Kayıt Tarihi</label>
                  <p className="text-slate-300 font-medium mt-0.5">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Sistemde Bulunamadı'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Oturum Bilgileri</p>
                
                <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-indigo-500/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">⏱️</span>
                    <span className="text-xs font-medium text-slate-400">Aktif Süre</span>
                  </div>
                  <span className="text-xs font-black font-mono text-indigo-400 tracking-tight">
                    {formatSessionTime(sessionTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">👋</span>
                    <span className="text-xs font-medium text-slate-400">Giriş Sayısı</span>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-400 tracking-tight">
                    {loginCount} <span className="text-[10px] font-normal text-slate-500">kez</span>
                  </span>
                </div>
              </div>

            </div>

            <div className="pt-4 mt-6 border-t border-slate-800 space-y-3">
              <Link
                href="/support"
                className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-[0.98] text-indigo-400 text-xs font-bold rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/20"
              >
                🎧 Destek Talebi Oluştur
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-black/20 flex items-center justify-center gap-2 border border-slate-700"
              >
                🔐 Şifremi Değiştir
              </button>
            </div>
          </div>

          {/* SAĞ BÖLÜM: MÜŞTERİ KARTLARI */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* KART 1: SİPARİŞ GEÇMİŞİ */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col transition-all hover:border-emerald-500/30 group">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-emerald-400 bg-emerald-500/10 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                  📦 Siparişlerim
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-200 mt-5">Sipariş Geçmişi</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Geçmiş siparişlerinizi ve kargo durumlarını buradan takip edebilirsiniz.</p>
              
              <div className="mt-auto pt-6 flex-1">
                <div className="h-full p-4 bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-center">
                  <span className="text-sm font-medium text-slate-500">Henüz bir siparişiniz bulunmuyor.</span>
                </div>
              </div>
            </div>

            {/* KART 2: ADRES BİLGİLERİ */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col transition-all hover:border-blue-500/30 group">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-blue-400 bg-blue-500/10 rounded-md border border-blue-500/20 flex items-center gap-1.5 w-fit">
                  📍 Adreslerim
                </span>
                <div className="flex justify-between items-center mt-5">
                  <h3 className="text-lg font-bold text-slate-200">Kayıtlı Adresler</h3>
                  <button 
                    onClick={() => { setEditingAddressId(null); setIsAddressModalOpen(true); }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg"
                  >
                    + Yeni Ekle
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Teslimat ve fatura adreslerinizi düzenleyip yenilerini ekleyebilirsiniz.</p>
              </div>
              
              {/* ADRES LİSTESİ RENDER ALANI */}
              <div className="mt-6 flex-1 overflow-y-auto max-h-[160px] pr-1 space-y-3">
                {addresses.length === 0 ? (
                  <div className="h-full p-4 bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-center">
                    <span className="text-xs text-slate-500">Henüz kayıtlı bir adresiniz yok.</span>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr._id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-start group/addr hover:border-blue-500/30 transition-colors">
                      <div className="pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-blue-400">{addr.title}</h4>
                          {addr.zipCode && <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md">{addr.zipCode}</span>}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{addr.fullAddress}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{addr.district} / {addr.city}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/addr:opacity-100 transition-opacity shrink-0">
                        {/* 🚀 YENİ: Düzenle butonu */}
                        <button 
                          onClick={() => handleEditClick(addr)}
                          title="Adresi Düzenle"
                          className="text-blue-400 p-1.5 hover:bg-blue-500/10 rounded-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(addr._id)}
                          title="Adresi Sil"
                          className="text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* KART 3: FAVORİLERİM */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between transition-all hover:border-rose-500/30 group md:col-span-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-rose-400 bg-rose-500/10 rounded-md border border-rose-500/20 flex items-center gap-1.5 w-fit">
                    ❤️ Favoriler
                  </span>
                  <h3 className="text-lg font-bold text-slate-200 mt-4">Beğendiğiniz Ürünler</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    İlginizi çeken ve daha sonra almak için kaydettiğiniz ürünlerin listesi.
                  </p>
                </div>
                <button onClick={() => router.push('/')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-600/20">
                  Alışverişe Başla
                </button>
              </div>
              <div className="mt-6 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <div className="min-w-[120px] h-[100px] bg-slate-950 border border-dashed border-slate-800 rounded-xl flex items-center justify-center">
                  <span className="text-2xl opacity-50">🛒</span>
                </div>
                <div className="text-sm text-slate-500">Favori listeniz şu an boş görünüyor. Vitrindeki ürünleri inceleyip kalp ikonuna tıklayarak buraya ekleyebilirsiniz.</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ŞİFRE DEĞİŞTİRME MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity">
          <div className="w-full max-w-md p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 transition-all transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-200">Şifre Güncelleme</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 text-sm font-bold cursor-pointer transition">✕</button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mevcut Şifre</label>
                <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Yeni Şifre</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Yeni Şifre (Tekrar)</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all" placeholder="••••••••" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 py-2.5 text-slate-400 border border-slate-800 font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer text-xs">İptal Et</button>
                <button type="submit" disabled={passwordLoading} className={`w-1/2 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-xs ${passwordLoading ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10'}`}>{passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 ADRES EKLEME / DÜZENLEME MODAL (Posta Kodu Dahil) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity">
          <div className="w-full max-w-md p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 transition-all transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-200">
                {editingAddressId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </h3>
              <button onClick={closeAddressModal} className="text-slate-500 hover:text-slate-300 text-sm font-bold cursor-pointer transition">✕</button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Adres Başlığı</label>
                <input 
                  type="text" required value={newAddress.title} 
                  onChange={(e) => setNewAddress({...newAddress, title: e.target.value})} 
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all" placeholder="Ev, İş, Okul vb." 
                />
              </div>
              
              {/* 3 Sütunlu Grid Yapısı (İl, İlçe, Posta Kodu) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">İl</label>
                  <input 
                    type="text" required value={newAddress.city} 
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} 
                    className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all" placeholder="Şehir" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">İlçe</label>
                  <input 
                    type="text" required value={newAddress.district} 
                    onChange={(e) => setNewAddress({...newAddress, district: e.target.value})} 
                    className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all" placeholder="İlçe" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Posta Kodu</label>
                  <input 
                    type="text" required value={newAddress.zipCode} 
                    onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})} 
                    className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all" placeholder="Örn: 34000" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Açık Adres</label>
                <textarea 
                  required rows="3" value={newAddress.fullAddress} 
                  onChange={(e) => setNewAddress({...newAddress, fullAddress: e.target.value})} 
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all resize-none" placeholder="Mahalle, sokak, bina no, daire no..." 
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                <button 
                  type="button" onClick={closeAddressModal} 
                  className="w-1/2 py-2.5 text-slate-400 border border-slate-800 font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer text-xs"
                >
                  İptal Et
                </button>
                <button 
                  type="submit" disabled={addressLoading} 
                  className={`w-1/2 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-xs ${addressLoading ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/10'}`}
                >
                  {addressLoading 
                    ? (editingAddressId ? 'Güncelleniyor...' : 'Ekleniyor...') 
                    : (editingAddressId ? 'Değişiklikleri Kaydet' : 'Adresi Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}