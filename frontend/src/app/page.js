'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    setMounted(true);
  }, []);

  // Sayfa yüklenene kadar boş ekran dön (göz kırpmasın)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-slate-50">
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  // HEM ZİYARETÇİLER HEM DE GİRİŞ YAPANLAR BURAYI GÖREBİLİR (Ürünler buraya gelecek)
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-69px)] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl p-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 text-center transition-all duration-300">
        <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">
          FULL-STACK E-TİCARET SİSTEMİ
        </span>
        <h1 className="text-5xl font-black text-slate-800 tracking-tight mt-6 leading-tight">
          Modern ve Güvenli <br /> Alışveriş <span className="text-indigo-600">Platformu</span>
        </h1>
        <p className="text-base text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
          Next.js App Router, TailwindCSS, Node.js, Mongoose ve MongoDB mimarisiyle geliştirilmiş e-ticaret altyapısı. Aktif ürünler listesi çok yakında burada olacak!
        </p>

        <div className="mt-8 flex justify-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-white font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all"
            >
              Yönetim Paneline Git
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-3.5 text-white font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-8 py-3.5 text-slate-600 font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex justify-center gap-6 text-xs text-slate-400 font-medium">
          <span>⚡ Next.js v15</span>
          <span>🛡️ JWT Secured</span>
          <span>🍃 MongoDB</span>
        </div>
      </div>
    </div>
  );
}