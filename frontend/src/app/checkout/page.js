'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State'leri
  const [address, setAddress] = useState({
    contactName: '',
    city: '',
    country: 'Türkiye',
    address: '',
    zipCode: ''
  });

  const [card, setCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });

  useEffect(() => {
    setMounted(true);
    if (cartItems.length === 0) {
      router.replace('/cart');
    }
  }, [cartItems, router]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // LocalStorage'dan kullanıcıyı al (Üye mi Misafir mi?)
      const userStr = localStorage.getItem('user');
      let userId = null;
      let guestEmail = null;

      if (userStr) {
        const userObj = JSON.parse(userStr);
        guestEmail = userObj.email; // Üyeyse de emailini alıyoruz
        // Backend'de userId varsa direkt onu atayabilirsin, yoksa guestEmail üzerinden gider
      } else {
        guestEmail = 'misafir@test.com'; // Formda email alanı açıp oradan da alabilirsin
      }

      // Backend'in beklediği formatta veriyi hazırlıyoruz
      const paymentData = {
        user: userId,
        guestEmail: guestEmail,
        items: cartItems.map(item => ({
          productId: item._id,
          productName: item.name,
          price: item.price,
          quantity: item.qty || 1
        })),
        shippingAddress: address,
        paymentCard: card,
        totalAmount: cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0)
      };

      const response = await axios.post('http://localhost:5000/api/payments/pay', paymentData);

      if (response.data.success) {
        toast.success('Ödeme Başarılı! Siparişiniz alındı.');
        clearCart(); // Ödeme başarılıysa sepeti RAM'den tamamen boşaltıyoruz
        
        setTimeout(() => {
          router.push('/'); // İstersen başarılı sayfasına (/success) da yönlendirebilirsin
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Ödeme reddedildi veya sunucuya ulaşılamadı.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-[100px] pb-20">
      <ToastContainer theme="dark" position="bottom-right" />
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <h1 className="text-3xl font-black text-white mb-8">Güvenli Ödeme</h1>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SOL: Adres ve Kart Bilgileri */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Teslimat Adresi Formu */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/80">
              <h2 className="text-xl font-bold text-indigo-400 mb-4">Teslimat Bilgileri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Ad Soyad" required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                  onChange={e => setAddress({...address, contactName: e.target.value})} />
                <input type="text" placeholder="Şehir" required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                  onChange={e => setAddress({...address, city: e.target.value})} />
                <div className="sm:col-span-2">
                  <textarea placeholder="Açık Adres (Mahalle, Sokak, No...)" required rows="3"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm resize-none"
                    onChange={e => setAddress({...address, address: e.target.value})}></textarea>
                </div>
                <input type="text" placeholder="Posta Kodu" required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                  onChange={e => setAddress({...address, zipCode: e.target.value})} />
                <input type="text" placeholder="Ülke" defaultValue="Türkiye" readOnly
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed text-sm" />
              </div>
            </div>

            {/* Kredi Kartı Formu */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/80">
              <h2 className="text-xl font-bold text-indigo-400 mb-4">Kart Bilgileri (İyzico Sandbox)</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Kart Üzerindeki İsim" required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                  onChange={e => setCard({...card, cardHolderName: e.target.value})} />
                <input type="text" placeholder="Kart Numarası (Test kartı giriniz)" required maxLength="16"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm font-mono tracking-widest"
                  onChange={e => setCard({...card, cardNumber: e.target.value})} />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Ay (Örn: 12)" required maxLength="2"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                    onChange={e => setCard({...card, expireMonth: e.target.value})} />
                  <input type="text" placeholder="Yıl (Örn: 2028)" required maxLength="4"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                    onChange={e => setCard({...card, expireYear: e.target.value})} />
                  <input type="text" placeholder="CVC" required maxLength="3"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm"
                    onChange={e => setCard({...card, cvc: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ: Ödeme Özeti */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800/80 sticky top-28">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Ödenecek Tutar</h3>
              <div className="flex justify-between items-center text-xl font-black text-indigo-400 mb-6">
                <span>Toplam</span>
                <span>{totalPrice.toLocaleString('tr-TR')} TL</span>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className={`w-full font-bold text-white py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 active:scale-95'
                }`}
              >
                {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
                {!loading && <span>🔒</span>}
              </button>
              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">256-bit İyzico Güvencesiyle</p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}