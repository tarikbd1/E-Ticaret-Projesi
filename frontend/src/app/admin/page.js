export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Gösterge Paneli</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium">Toplam Ürün</h3>
          <p className="text-3xl font-bold text-indigo-400 mt-2">--</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium">Toplam Sipariş</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">--</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium">Açık Destek Talebi</h3>
          <p className="text-3xl font-bold text-rose-400 mt-2">--</p>
        </div>
      </div>
    </div>
  );
}