'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Admin menüsündeki linkleri burada tanımlıyoruz
  const menuItems = [
    { name: 'Gösterge Paneli', path: '/admin', icon: '📊' },
    { name: 'Ürün Yönetimi', path: '/admin/products', icon: '🛍️' },
    { name: 'Sipariş Yönetimi', path: '/admin/orders', icon: '📦' },
    { name: 'Destek Talepleri', path: '/admin/tickets', icon: '🎧' }, // EKLENEN YENİ LİNK
  ];

  return (
    <div className="min-h-[calc(100vh-69px)] flex bg-slate-950">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <span>👑</span> Yönetim Paneli
          </h2>
          <p className="text-xs text-slate-500 mt-1">Tüm sistemi buradan yönetin.</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            // Hangi sayfadaysak o linki parlatıyoruz
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mağazaya Dön Butonu */}
        <div className="p-4 border-t border-slate-800">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors text-xs font-bold"
          >
            <span>🏪</span> Mağazaya Geri Dön
          </Link>
        </div>
      </aside>

      {/* SAĞ İÇERİK ALANI (Sayfalar buranın içinde açılır) */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}