const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // 🚀 1. DEĞİŞİKLİK: Misafir alışverişine izin veriyoruz
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Artık zorunlu değil (Misafirler için boş kalacak)
  },
  guestEmail: { 
    type: String, 
    required: false // Eğer kullanıcı misafirse e-postasını buraya yazacağız
  },
  
  items: [
    {
      // 🚀 2. DEĞİŞİKLİK: Stok düşme algoritması için ürün ID'si eklendi
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      productName: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  
  totalAmount: { 
    type: Number, 
    required: true 
  },
  
  // 🚀 3. DEĞİŞİKLİK: İyzico'nun zorunlu tuttuğu adres alanları eklendi
  shippingAddress: {
    contactName: { type: String, required: true }, // Alıcı Adı Soyadı
    address: { type: String, required: true },     // Açık Adres
    city: { type: String, required: true },        // Şehir
    country: { type: String, required: true },     // Ülke (İyzico için şart)
    zipCode: { type: String }                      // Posta Kodu
  },
  
  status: {
    type: String,
    enum: ['Bekliyor', 'Hazırlanıyor', 'Kargolandı', 'Teslim Edildi', 'İptal Edildi'],
    default: 'Hazırlanıyor' // Sipariş ödendiğinde direkt Hazırlanıyor'a düşmeli
  },

  // 🚀 4. DEĞİŞİKLİK: İyzico Referans Numarası (İleride iade vb. işlemler için hayat kurtarır)
  iyzicoPaymentId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);