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

  // YENİ EKLENEN: Kayıtlı Adresleri ve Kullanıcı Adını Tutacağımız State'ler
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [userName, setUserName] = useState('');

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

  // 1. Sepet Kontrolü
  useEffect(() => {
    setMounted(true);
    if (cartItems.length === 0) {
      router.replace('/cart');
    }
  }, [cartItems, router]);

  // 2. YENİ EKLENEN: Profildeki Adresleri Veritabanından Çekme Motoru
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.addresses) {
            setSavedAddresses(res.data.addresses);
          }
          if (res.data && res.data.name) {
            setUserName(res.data.name);
          }
        } catch (error) {
          console.error("Adresleri çekerken hata oluştu:", error);
        }
      }
    };
    fetchProfile();
  }, []);

  // 3. YENİ EKLENEN: Tıklanan Adresi Forma Dolduran Fonksiyon
  // 3. YENİ EKLENEN: Tıklanan Adresi Forma Dolduran Fonksiyon
  const handleSelectSavedAddress = (addr) => {
    setAddress({
      ...address,
      contactName: userName || '', 
      city: addr.city || '',
      country: 'Türkiye',
      address: `${addr.district ? addr.district + ' - ' : ''}${addr.fullAddress || ''}`,
      // Eğer kullanıcının eski kayıtlı adresiyse ve posta kodu yoksa mecburen 34000 atsın, varsa yenisini atsın:
      zipCode: addr.zipCode || '34000' 
    });
    toast.info(`"${addr.title}" adresi uygulandı!`);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userStr = localStorage.getItem('user');
      let userId = null;
      let guestEmail = 'misafir@test.com';

      if (userStr) {
        const userObj = JSON.parse(userStr);
        userId = userObj._id || userObj.id || userObj.userId || userObj.user_id;
        guestEmail = userObj.email || 'misafir@test.com';
      }

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
        toast.success('Ödeme Başarılı!');
        clearCart(); 
        setTimeout(() => { router.push('/success'); }, 1500);
      }
    } catch (error) {
      toast.error('Ödeme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);

  if (!mounted) return <div className="min-h-screen bg-[#020617]"></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pt-[100px] pb-20">
      <ToastContainer theme="dark" position="bottom-right" autoClose={2000} />
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <h1 className="text-3xl font-black text-white mb-8">Güvenli Ödeme</h1>
        
        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            
            {/* 🚀 YENİ EKLENEN: KAYITLI ADRESLER KUTUSU */}
            {savedAddresses.length > 0 && (
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/80">
                <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <span className="text-xl">📍</span> Kayıtlı Adreslerim
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map(addr => (
                    <div 
                      key={addr._id} 
                      onClick={() => handleSelectSavedAddress(addr)}
                      className="p-4 bg-slate-950/80 border border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer transition-all group shadow-lg"
                    >
                      <h3 className="text-sm font-bold text-blue-300 mb-1">{addr.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{addr.district} / {addr.city}</p>
                      <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Forma Uygula</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TESLİMAT BİLGİLERİ FORMU (Otomatik dolması için value değerleri eklendi) */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/80">
              <h2 className="text-xl font-bold text-indigo-400 mb-4">Teslimat Bilgileri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Ad Soyad" required value={address.contactName} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setAddress({...address, contactName: e.target.value})} />
                <input type="text" placeholder="Şehir" required value={address.city} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setAddress({...address, city: e.target.value})} />
                <textarea placeholder="Açık Adres" required rows="3" value={address.address} className="w-full sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none resize-none" onChange={e => setAddress({...address, address: e.target.value})}></textarea>
                <input type="text" placeholder="Posta Kodu" required value={address.zipCode} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setAddress({...address, zipCode: e.target.value})} />
              </div>
            </div>

            {/* KART BİLGİLERİ FORMU */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/80">
              <h2 className="text-xl font-bold text-indigo-400 mb-4">Kart Bilgileri</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Kart Üzerindeki İsim" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setCard({...card, cardHolderName: e.target.value})} />
                <input type="text" placeholder="Kart Numarası" required maxLength="16" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setCard({...card, cardNumber: e.target.value})} />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="Ay" required maxLength="2" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setCard({...card, expireMonth: e.target.value})} />
                  <input type="text" placeholder="Yıl" required maxLength="4" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setCard({...card, expireYear: e.target.value})} />
                  <input type="text" placeholder="CVC" required maxLength="3" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setCard({...card, cvc: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800/80 sticky top-28">
              <h3 className="text-lg font-bold text-white mb-4">Ödenecek Tutar</h3>
              <p className="text-2xl font-black text-indigo-400 mb-6">{totalPrice.toLocaleString('tr-TR')} TL</p>
              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                  loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İşlem Sağlanıyor...
                  </>
                ) : (
                  'Ödemeyi Tamamla'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}