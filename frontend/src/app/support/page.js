'use client';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Destek talebiniz başarıyla alındı. En kısa sürede dönüş yapacağız!');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Formu temizle
      } else {
        toast.error(data.message || 'Bir hata oluştu.');
      }
    } catch (error) {
      toast.error('Sunucuyla bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-69px)] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="max-w-3xl w-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-5">
          
          {/* Sol Taraf: Bilgi ve İletişim Detayları */}
          <div className="bg-indigo-600 p-8 md:col-span-2 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div>
              <h2 className="text-2xl font-extrabold mb-2">Bize Ulaşın</h2>
              <p className="text-indigo-200 text-sm mb-8 leading-relaxed">
                Siparişlerinizle ilgili bir sorun mu var veya sormak istediğiniz bir şey mi bulunuyor? Formu doldurun, size hemen yardımcı olalım.
              </p>
            </div>
            <div className="space-y-6 text-sm">
              <div className="flex items-center gap-4">
                <span className="p-2 bg-indigo-500/50 rounded-lg">📧</span>
                <span>destek@eticaret.com</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="p-2 bg-indigo-500/50 rounded-lg">📞</span>
                <span>+90 (850) 123 45 67</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="p-2 bg-indigo-500/50 rounded-lg">📍</span>
                <span>Teknoloji Vadisi, İstanbul</span>
              </div>
            </div>
          </div>

          {/* Sağ Taraf: Destek Formu */}
          <div className="p-8 md:col-span-3 bg-slate-900">
            <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Destek Talebi Oluştur</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Adınız Soyadınız</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-Posta Adresiniz</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="ornek@mail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Konu</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="Siparişim hakkında / İade süreci"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mesajınız</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                  placeholder="Lütfen sorununuzu detaylıca açıklayın..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                  loading ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
                }`}
              >
                {loading ? 'Gönderiliyor...' : 'Talebi Gönder'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}