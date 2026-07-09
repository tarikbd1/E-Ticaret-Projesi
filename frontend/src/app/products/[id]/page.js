import Link from 'next/link';

// Tekil ürünü backend'den çeken SSR fonksiyonu
async function getProduct(id) {
  const res = await fetch(`http://localhost:5000/api/products/${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Ürün detayı çekilemedi');
  }
  
  return res.json();
}

export default async function ProductDetailPage({ params }) {
  // URL'deki [id] parametresini alıyoruz
  const { id } = await params;
  const data = await getProduct(id);
  const product = data.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Geri Dön Butonu */}
        <Link 
          href="/"
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium mb-8 transition-colors"
        >
          <span className="mr-2">←</span> Tüm Ürünlere Dön
        </Link>
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          
          {/* Sol Taraf: Ürün Görseli */}
          <div className="md:w-1/2 bg-slate-800 p-8 flex items-center justify-center min-h-[400px]">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
            />
          </div>
          
          {/* Sağ Taraf: Ürün Detayları */}
          <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
              {product.name}
            </h1>
            
            <p className="text-4xl font-black text-indigo-500 mb-6">
              {product.price.toLocaleString('tr-TR')} TL
            </p>
            
            <div className="prose prose-invert mb-8">
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Ürün Açıklaması</h3>
              <p className="text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>
            
            {/* Stok Durumu */}
            <div className="mb-8">
              {product.stock > 0 ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  Stokta Var ({product.stock} adet)
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Stokta Yok
                </span>
              )}
            </div>
            
            {/* Sepete Ekle Butonu */}
            <button 
              disabled={product.stock === 0}
              className={`w-full py-4 px-6 rounded-xl text-lg font-bold transition-all transform active:scale-95 ${
                product.stock > 0 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Sepete Ekle' : 'Tükendi'}
            </button>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}