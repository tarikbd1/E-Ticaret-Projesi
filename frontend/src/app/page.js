import Link from 'next/link';

// 1. SSR (Server-Side Rendering) ile verileri arka plandan çeken fonksiyon
async function getProducts() {
  // Backend'in çalıştığı porttan veriyi çekiyoruz (cache: 'no-store' ile her seferinde güncel veriyi alır)
  const res = await fetch('http://localhost:5000/api/products', {
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    throw new Error('Ürünler çekilirken bir hata oluştu');
  }
  
  return res.json();
}

// 2. Ana sayfa bileşeni (Server Component)
export default async function HomePage() {
  // Yukarıdaki fonksiyondan dönen veriyi bekliyoruz
  const data = await getProducts();
  const products = data.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400 mb-8">
          Tüm Ürünler
        </h1>
        
        {/* Ürün Kartları Izgarası */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 flex flex-col">
              
              <div className="h-48 w-full bg-slate-800 relative flex items-center justify-center overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-slate-200 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-indigo-400 font-bold text-xl mb-4 mt-auto">
                  {product.price.toLocaleString('tr-TR')} TL
                </p>
                
                <Link 
                  href={`/products/${product._id}`}
                  className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                >
                  İncele
                </Link>
              </div>
              
            </div>
          ))}
        </div>
        
        {/* Eğer hiç ürün yoksa */}
        {products.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            Henüz hiç ürün eklenmemiş.
          </div>
        )}
        
      </div>
    </div>
  );
}