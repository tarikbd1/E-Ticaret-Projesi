import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'E-Ticaret Sistemi',
  description: 'Full-Stack E-Ticaret ve Destek Platformu',
};

export const viewport = {
  colorScheme: 'dark',
  themeColor: '#020617',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" style={{ backgroundColor: '#020617' }}>
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