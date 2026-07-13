'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore'; 

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  const [mounted, setMounted] = useState(false); 

  const router = useRouter();
  const pathname = usePathname();

  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    setMounted(true); 
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user'); 
    
    setIsLoggedIn(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, [pathname]);

  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    // Göz kırpma hatasını önlemek için arayüzü (state) burada sıfırlamıyoruz.
    // Yönlendirme bittiğinde Navbar zaten yeniden hesaplanacak veya gizlenecek.
    router.replace('/login');
  };

  return (
    <nav className="w-full bg-slate-950 text-slate-100 border-b border-slate-900/80 px-4 sm:px-6 py-3 flex justify-between items-center shadow-xl sticky top-0 z-50">
      
      {/* SOL: LOGO */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-slate-100 cursor-pointer group">
          <div className="relative flex items-center justify-center w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg group-hover:bg-indigo-500/20 transition-all">
            <img 
              src="https://flagcdn.com/tr.svg" 
              alt="Türk Bayrağı" 
              className="w-4 h-auto rounded-[2px] shadow-sm opacity-90"
            />
          </div>
          <span><span className="text-indigo-400">E-Ticaret</span>Projesi</span>
        </Link>
      </div>
      
      {/* SAĞ: MENÜ, SEPET VE PROFİL */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Ortak Link */}
        <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          Ürünler
        </Link>

        {/* Sepet İkonu */}
        <Link href="/cart" className="relative p-1 text-slate-300 hover:text-indigo-400 transition-colors group" title="Sepete Git">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 transition-transform group-hover:scale-110">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          {mounted && totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-slate-950">
              {totalItems}
            </span>
          )}
        </Link>

        {isLoggedIn && <div className="hidden sm:block w-px h-6 bg-slate-800"></div>}

        {isLoggedIn ? (
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Şık Kullanıcı Profil Alanı */}
            <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <div className="hidden sm:flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-0.5">
                  {user?.role === 'admin' ? 'Yönetici' : 'Müşteri'}
                </span>
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors leading-none">
                  {user?.name?.split(' ')[0] || 'Hesabım'}
                </span>
              </div>
            </Link>

            {/* Minimal Çıkış İkonu */}
            <button 
              onClick={handleLogout}
              className="group flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-200"
              title="Çıkış Yap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 group-hover:text-rose-400 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
              </svg>
            </button>
            
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className="text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-5 py-2.5 rounded-xl border border-indigo-500/20 transition-all duration-200 text-center">
              Giriş Yap
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}