'use client';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-4">
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-4xl font-black mb-4">Ödemeniz Başarıyla Alındı!</h1>
      <p className="text-slate-400 mb-8">Siparişiniz hazırlanıyor, bizi tercih ettiğiniz için teşekkürler.</p>
      <button 
        onClick={() => router.push('/')}
        className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold transition-all"
      >
        Ana Sayfaya Dön
      </button>
    </div>
  );
}