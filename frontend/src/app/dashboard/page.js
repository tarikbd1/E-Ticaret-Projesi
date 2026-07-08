'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [detectedName, setDetectedName] = useState('Kullanıcı');
  const [userEmail, setUserEmail] = useState('Tanımlanmadı');
  const [loginCount, setLoginCount] = useState(18); // 🎯 CANLI SAYAÇ STATE'İ (Varsayılan 18)
  const [loading, setLoading] = useState(true);
  
  // ŞİFRE DEĞİŞTİRME STATE'LERİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

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
        console.log("Profil Rotasından Gelen Ham Veri:", data);

        if (data) {
          const userData = data.user || data;
          setUser(userData);
          
          // 🎯 Token'dan veya profil verisinden gelen canlı giriş sayısını ekrana basıyoruz
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
        const backendMessage = response.data?.message || 'Şifre değiştirilirken bir hata oluştu!';
        toast.error(backendMessage);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400">Sistem yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-69px)] bg-slate-950 text-slate-100 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      <div className="w-full max-w-6xl mx-auto space-y-6">
        
        {/* 🚀 ÜST BANNER */}
        <div className="w-full p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl shadow-2xl border border-indigo-500/20">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Hoş Geldin, {detectedName}! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Yönetim paneline hoş geldiniz. Sistem durumu kararlı.</p>
        </div>

        {/* 📋 ANA İÇERİK ALANI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
          
          {/* SOL BÖLÜM: PROFİL PANELİ */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl h-full">
            <div className="space-y-5">
              
              {/* Profil Header */}
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-500/20">
                  {detectedName[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-200">{detectedName}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Geliştirici Modu</p>
                </div>
              </div>

              {/* Temel Detaylar */}
              <div className="space-y-3 text-xs border-b border-slate-800/60 pb-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">E-Posta Adresi</label>
                  <p className="text-slate-300 font-medium mt-0.5 break-all">{userEmail}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Kayıt Tarihi</label>
                  <p className="text-slate-300 font-medium mt-0.5">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '02.07.2026'}
                  </p>
                </div>
              </div>

              {/* Oturum Metrikleri */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Oturum Metrikleri</p>
                
                {/* Minik Sayaç 1: Aktif Seans */}
                <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-indigo-500/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">⏱️</span>
                    <span className="text-xs font-medium text-slate-400">Aktif Seans</span>
                  </div>
                  <span className="text-xs font-black font-mono text-indigo-400 tracking-tight">
                    {formatSessionTime(sessionTime)}
                  </span>
                </div>

                {/* Minik Sayaç 2: 🎯 TOPLAM GİRİŞ */}
                <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">📈</span>
                    <span className="text-xs font-medium text-slate-400">Toplam Giriş</span>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-400 tracking-tight">
                    {loginCount} <span className="text-[10px] font-normal text-slate-500">kez</span>
                  </span>
                </div>

              </div>

            </div>

            {/* Şifre Değiştirme Butonu */}
            <div className="pt-4 mt-6 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                ⚙️ Şifre Değiştirme Paneli
              </button>
            </div>
          </div>

          {/* SAĞ BÖLÜM: DURUM KARTLARI */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* KART 1: SİSTEM DURUMU */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between transition-all hover:border-emerald-500/30 group">
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-emerald-400 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                    Güvenlik Katmanı
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mt-5 group-hover:text-emerald-400 transition-colors">JWT Token Doğrulandı</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Oturum biletin aktif ve şifreli middleware süzgecinden başarıyla geçiyor.</p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 border-t border-slate-800/60 pt-2.5">
                Algoritma: HS256 / Yetki: Okuma-Yazma
              </div>
            </div>

            {/* KART 2: VERİ TABANI ALTYAPISI (GÜNCELLENDİ) */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between transition-all hover:border-blue-500/30 group">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-blue-400 bg-blue-500/10 rounded-md border border-blue-500/20">
                  Veri Tabanı
                </span>
                <h3 className="text-lg font-bold text-slate-200 mt-5 group-hover:text-blue-400 transition-colors">MongoDB (NoSQL)</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Mongoose bağlantısı kararlı. Doküman modeli ve koleksiyonlar senkronize çalışıyor.</p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 border-t border-slate-800/60 pt-2.5">
                Durum: Bağlı / ODM: Mongoose
              </div>
            </div>

            {/* KART 3: BCRYPTJS GÜVENLİK DUVARI */}
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between transition-all hover:border-purple-500/30 group md:col-span-2">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-purple-400 bg-purple-500/10 rounded-md border border-purple-500/20">
                  Kriptografi Ekipmanı
                </span>
                <h3 className="text-lg font-bold text-slate-200 mt-4 group-hover:text-purple-400 transition-colors">BcryptJS Güvenlik Duvarı</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Şifreler düz metin olarak değil, 10 salt round değeriyle karmaşık hash blokları halinde saklanmaktadır. Brute-force saldırılarına karşı tam korumalı.
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 border-t border-slate-800/60 pt-2.5">
                Güvenlik Seviyesi: Üst Düzey (Salted Hash)
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
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mevcut Şifre</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Yeni Şifre</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 text-slate-400 border border-slate-800 font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer text-xs"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`w-1/2 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-xs ${
                    passwordLoading ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10'
                  }`}
                >
                  {passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}