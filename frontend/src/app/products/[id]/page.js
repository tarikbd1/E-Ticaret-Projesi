import AddToCartButton from '../../../components/AddToCartButton';

// Backend'den ürün bilgisini çeken fonksiyon
async function getProduct(id) {
  const res = await fetch(`http://localhost:5000/api/products/${id}`, {
    cache: 'no-store' // Her zaman en güncel veriyi çekmesi için
  });
  
  if (!res.ok) {
    throw new Error('Ürün detayı çekilemedi');
  }
  
  return res.json();
}

export default async function ProductDetailPage({ params }) {
  // params'ı Promise'den çıkarıyoruz (hatırlarsan ilk başta bunu çözmüştük)
  const { id } = await params;
  
  const data = await getProduct(id);
  const product = data.data;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Sol Taraf: Ürün Görseli */}
          <div className="bg-slate-800 flex items-center justify-center p-12 min-h-[300px]">
            {/* Eğer veritabanında resim URL'si varsa product.image kullanabilirsin. Şimdilik şık bir kutu koyduk. */}
            <div className="text-6xl text-slate-600">
              {product.image ? (
                <img src={product.image} alt={product.name} className="max-w-full rounded-xl" />
              ) : (
                "📦"
              )}
            </div>
          </div>

          {/* Sağ Taraf: Ürün Detayları ve Buton */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold text-white mb-2">{product.name}</h1>
            
            <div className="text-2xl font-bold text-indigo-400 mb-6">
              {product.price.toLocaleString('tr-TR')} TL
            </div>

            <p className="text-slate-400 mb-8 leading-relaxed">
              {product.description || "Bu ürün için henüz bir açıklama girilmemiş. Ancak kalitesinden şüpheniz olmasın!"}
            </p>

            <div className="mb-8">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {product.stock > 0 ? `Stokta ${product.stock} adet var` : 'Stokta Yok'}
              </span>
            </div>

            {/* SEPETE EKLE BUTONU BURADA ÇALIŞIYOR */}
            {product.stock > 0 ? (
              <AddToCartButton product={product} />
            ) : (
              <button disabled className="w-full bg-slate-800 text-slate-500 font-bold py-4 px-6 rounded-xl cursor-not-allowed">
                Tükendi
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}