import './globals.css';
import Navbar from './Navbar';

export const metadata = {
  title: 'E-Ticaret Sistemi',
  description: 'Full-Stack E-Ticaret ve Destek Platformu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      {/* Arka planı karanlık temaya çevirdik ve sayfayı tam ekran (min-h-screen) yaptık */}
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        
        {/* Akıllı Navbar'ımız hep en üstte kalacak */}
        <Navbar />
        
        {/* İçeriklerin esnek bir şekilde ekrana yayılması için flex-grow ekledik */}
        <main className="flex-grow w-full">
          {children}
        </main>

      </body>
    </html>
  );
}