'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  // E-postadan gelen bağlantıdaki token'ı yakalıyoruz
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Geçersiz veya eksik bağlantı tokenı!');
    }
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Şifreler birbiriyle uyuşmuyor!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır!');
      return;
    }

    if (!token) {
      toast.error('Sıfırlama tokenı bulunamadı, işlem yapılamaz!');
      return;
    }

    setLoading(true);

    try {
      // Backend'deki resetPassword fonksiyonuna yönlendiriyoruz
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        newPassword
      }, {
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.status >= 400) {
        const backendMessage = response.data?.message || 'Şifre yenilenirken bir hata oluştu!';
        toast.error(backendMessage);
        setLoading(false);
        return;
      }

      toast.success('Şifreniz başarıyla yenilendi! Giriş sayfasına aktarılıyorsunuz...');

      // 1.5 saniye sonra pürüzsüzce giriş kapısına şutluyoruz
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (err) {
      toast.error('Sunucuyla bağlantı kurulamadı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl transition-all transform scale-100">

        {/* ÜST GEOMETRİK LOGO / BAŞLIK ALANI */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-400/20 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="text-2xl animate-pulse">🔑</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Yeni Şifre Belirle
          </h1>
          <p className="text-xs text-slate-400">Güvenliğiniz için lütfen yeni ve güçlü bir şifre girin.</p>
        </div>

        {/* ŞİFRE SIFIRLAMA FORMU */}
        <form onSubmit={handleResetPassword} className="space-y-4">
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

          {/* ŞİFREYİ GÜNCELLE BUTONU */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm flex items-center justify-center gap-2 ${
                loading ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10 active:scale-[0.99]'
              }`}
            >
              {loading ? 'Şifre Güncelleniyor...' : 'Yeni Şifreyi Kaydet'}
            </button>
          </div>
        </form>

        {/* GİRİŞ SAYFASINA GEÇİŞ */}
        <div className="text-center mt-6 pt-4 border-t border-slate-800/50">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
          >
            Giriş Sayfasına Dön
          </button>
        </div>

      </div>
    </div>
  );
}