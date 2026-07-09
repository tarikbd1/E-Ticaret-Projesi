export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sol Menü (Sidebar) - Sadece Adminlere Özel */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-indigo-500 mb-8">Admin Panel</h2>
        <nav className="space-y-4">
          <a href="/admin" className="block text-slate-300 hover:text-white transition-colors">Gösterge Paneli</a>
          <a href="/admin/products" className="block text-slate-300 hover:text-white transition-colors">Ürün Yönetimi</a>
          <a href="/admin/orders" className="block text-slate-300 hover:text-white transition-colors">Siparişler</a>
        </nav>
      </aside>

      {/* Sağ Taraf - İçerik Alanı */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}