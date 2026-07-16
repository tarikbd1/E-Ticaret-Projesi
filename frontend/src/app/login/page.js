'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      }, {
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.status >= 400) {
        const backendMessage = response.data?.message || 'Giriş yapılırken bir hata oluştu!';
        toast.error(backendMessage);
        setLoading(false);
        return;
      }

      if (response.data?.token) {
        const userEmail = response.data.email;

        // 1. Token'ı kaydediyoruz
        localStorage.setItem('token', response.data.token);
        
        // 2. Kullanıcı bilgilerini (isim, rol) Navbar'da vb. kullanmak için kaydediyoruz
        localStorage.setItem('user', JSON.stringify({
          name: response.data.name,
          role: response.data.role,
          email: userEmail
        }));

        // 🚀 ZUSTAND DİNAMİK SEPET YÖNETİMİ: Misafir Sepetini Kullanıcıya Aktar
        const guestCart = localStorage.getItem('cart_guest'); // Yeni yazdığımız motorun misafir sepeti
        const userCartKey = `cart_${userEmail}`; // Yeni motorun kullanıcıya özel sepeti

        if (guestCart) {
          // Misafirin sepetinde ürün varsa, bunu giriş yapan adamın özel anahtarına aktar
          localStorage.setItem(userCartKey, guestCart);
          // Aktarım bittiğine göre misafir sepetini temizle
          localStorage.removeItem('cart_guest');
        }

        // Eski sistemden kalan gereksiz kalıntıları da garanti olsun diye temizliyoruz
        localStorage.removeItem('cart'); 
        sessionStorage.removeItem('guestUser'); 

        // 3. Trafik Polisi Zekası: Rolüne göre yönlendir (🔥 DİKKAT: window.location.href kullanıldı)
        if (response.data.role === 'admin') {
          toast.success('Yönetici girişi başarılı! Panele yönlendiriliyorsunuz...');
          setTimeout(() => {
            // router.replace yerine tam sayfa yenileme yapıyoruz ki Zustand'ın RAM'i temizlensin
            window.location.href = '/admin';
          }, 1000);
        } else {
          // Normal müşteri ise ana sayfaya (vitrine) şutla
          toast.success(`Hoş geldin ${response.data.name}! Vitrine yönlendiriliyorsunuz...`);
          setTimeout(() => {
            // router.replace yerine tam sayfa yenileme yapıyoruz ki Zustand'ın RAM'i temizlensin
            window.location.href = '/';
          }, 1000);
        }
      } else {
        toast.error('Token bilgisi alınamadı!');
        setLoading(false);
      }

    } catch (err) {
      toast.error('Sunucuyla bağlantı kurulamadı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
      
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl transition-all transform scale-100">
        
        {/* ÜST GEOMETRİK LOGO / BAŞLIK ALANI */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-400/20 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="text-2xl animate-pulse">🛡️</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Hesabınızla Giriş Yapın
          </h1>
          <p className="text-xs text-slate-400">Yönetici paneline erişmek için bilgilerinizi girin.</p>
        </div>

        {/* GİRİŞ FORMU */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">E-Posta Adresi</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 mt-1.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all"
              placeholder="ornek@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Şifre</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-4 pr-12 py-2.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-slate-200 text-sm placeholder-slate-700 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {/* Minimal SVG Buton */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none p-1 flex items-center justify-center"
                title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ŞİFREMİ UNUTTUM: Tam Ortada */}
          <div className="flex justify-center items-center pt-1">
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer text-center"
            >
              Şifremi Unuttum
            </button>
          </div>

          {/* GİRİŞ BUTONU */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm flex items-center justify-center gap-2 ${
                loading ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10 active:scale-[0.99]'
              }`}
            >
              {loading ? 'Oturum Açılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

        {/* KAYIT OLMAYA GEÇİŞ LINKI */}
        <div className="text-center mt-6 pt-4 border-t border-slate-800/50">
          <p className="text-xs text-slate-400">
            Henüz bir hesabınız yok mu?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
            >
              Kayıt Ol
            </button>
          </p>
        </div>

        {/* ALT BİLGİ NOTU */}
        <div className="text-center mt-4">
          <p className="text-[11px] text-slate-500 font-mono">
            Güvenlik katmanı aktif. JWT & BcryptJS korumalı alan.
          </p>
        </div>

      </div>
    </div>
  );
}