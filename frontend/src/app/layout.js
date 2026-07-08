import './globals.css';
import Navbar from './Navbar';

export const metadata = {
  title: 'E-Ticaret Sistemi',
  description: 'Full-Stack E-Ticaret ve Destek Platformu',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="antialiased bg-slate-50 text-slate-900">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}