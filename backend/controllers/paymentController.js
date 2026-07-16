const Iyzipay = require('iyzipay');
const Order = require('../models/Order');
const Product = require('../models/Product'); // Stok düşmek ve fiyatı doğrulamak için Product modelini çağırıyoruz

const iyzipay = new Iyzipay({
  apiKey: 'sandbox-OZw3h4xpQ5Lkc9v424p8bju3C2fZZoo8', // İyzico Sandbox panelinden aldığın kendi Key'ini buraya yapıştır
  secretKey: 'sandbox-B6fW2J7XUUAhawGGdHxaLRYem2tE2iX1', // İyzico Sandbox panelinden aldığın kendi Secret'ını buraya yapıştır
  uri: 'https://sandbox-api.iyzipay.com'
});

exports.createPayment = async (req, res) => {
  try {
    // Frontend'den gelen sepet, adres, kullanıcı (misafir veya üye) ve kart bilgilerini alıyoruz[cite: 1]
    const { user, guestEmail, items, shippingAddress, paymentCard } = req.body;

    // 🚀 ADIM 1: GÜVENLİK - FİYAT DOĞRULAMASI[cite: 1]
    // Frontend'den gelen fiyata güvenmiyoruz. Veritabanından gerçek fiyatları bulup topluyoruz.
    let calculatedTotal = 0;
    const basketItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Ürün bulunamadı: ${item.productName}` });
      }
      
      calculatedTotal += product.price * item.quantity;

      // İyzico'nun beklediği özel sepet formatına (BasketItem) dönüştürüyoruz
      basketItems.push({
        id: product._id.toString(),
        name: product.name,
        category1: product.category || 'Genel',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: (product.price * item.quantity).toString()
      });
    }

    // 🚀 ADIM 2: İYZİCO ÖDEME İSTEĞİ OLUŞTURMA[cite: 1]
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: Date.now().toString(),
      price: calculatedTotal.toString(), // Bizim hesapladığımız GERÇEK fiyat
      paidPrice: calculatedTotal.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: 'BASKET_' + Date.now().toString(),
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: paymentCard, // Frontend formundan gelecek kredi kartı bilgileri
      buyer: {
        id: user || 'guest_' + Date.now().toString(), // Üye veya misafir ID'si[cite: 1]
        name: shippingAddress.contactName.split(' ')[0] || 'Misafir',
        surname: shippingAddress.contactName.split(' ').slice(1).join(' ') || 'Kullanıcı',
        gsmNumber: '+905555555555', // İyzico test için sabit GSM
        email: guestEmail || 'test@test.com',
        identityNumber: '74300864791', // İyzico Sandbox ortamında test için zorunlu TC
        lastLoginDate: '2023-01-01 12:00:00',
        registrationDate: '2023-01-01 12:00:00',
        registrationAddress: shippingAddress.address,
        ip: '85.34.78.112',
        city: shippingAddress.city,
        country: shippingAddress.country,
        zipCode: shippingAddress.zipCode || '34000'
      },
      shippingAddress: {
        contactName: shippingAddress.contactName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: shippingAddress.address,
        zipCode: shippingAddress.zipCode || '34000'
      },
      billingAddress: {
        contactName: shippingAddress.contactName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: shippingAddress.address,
        zipCode: shippingAddress.zipCode || '34000'
      },
      basketItems: basketItems
    };

    // 🚀 ADIM 3: İYZİCO'YA İSTEĞİ FIRLATMA[cite: 1]
    iyzipay.payment.create(request, async (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'İyzico sunucusuna ulaşılamadı.', error: err });
      }

      if (result.status === 'success') {
        // Ödeme Başarılı! Siparişi Veritabanına Kaydet[cite: 1]
        const newOrder = new Order({
          user: user || null,
          guestEmail: guestEmail,
          items: items,
          totalAmount: calculatedTotal,
          shippingAddress: shippingAddress,
          status: 'Hazırlanıyor', // Direkt hazırlanıyor aşamasına geçiyoruz
          iyzicoPaymentId: result.paymentId
        });

        await newOrder.save();

        // 🚀 ADIM 4: STOK DÜŞME ALGORİTMASI[cite: 1]
        for (const item of items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity } // Satın alınan miktar kadar stoğu azaltıyoruz
          });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Ödeme başarılı, sipariş alındı!', 
          orderId: newOrder._id 
        });

      } else {
        // Kart reddedildi, bakiye yetersiz vb. İyzico'dan dönen hatayı müşteriye göster
        return res.status(400).json({ 
          success: false, 
          message: result.errorMessage 
        });
      }
    });

  } catch (error) {
    console.error('Ödeme Algoritması Hatası:', error);
    res.status(500).json({ success: false, message: 'İşlem sırasında sunucu hatası oluştu.' });
  }
};