const Iyzipay = require('iyzipay');
const Order = require('../models/Order');
const Product = require('../models/Product');

const iyzipay = new Iyzipay({
  apiKey: 'sandbox-OZw3h4xpQ5Lkc9v424p8bju3C2fZZoo8',
  secretKey: 'sandbox-B6fW2J7XUUAhawGGdHxaLRYem2tE2iX1',
  uri: 'https://sandbox-api.iyzipay.com'
});

exports.createPayment = async (req, res) => {
    console.log("Gelen Request Body:", req.body);
  try {
    const { user, guestEmail, items, shippingAddress, paymentCard } = req.body;

    // ÖNEMLİ: Eğer user bir obje ise ID'sini al, değilse olduğu gibi bırak
    const userId = user && typeof user === 'object' ? user._id : user;

    let calculatedTotal = 0;
    const basketItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Ürün bulunamadı: ${item.productName}` });
      }
      
      const itemPrice = product.price * item.quantity;
      calculatedTotal += itemPrice;

      basketItems.push({
        id: product._id.toString(),
        name: product.name,
        category1: product.category || 'Genel',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: itemPrice.toFixed(2).toString()
      });
    }

    const finalTotal = calculatedTotal.toFixed(2);

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: Date.now().toString(),
      price: finalTotal,
      paidPrice: finalTotal,
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: 'BASKET_' + Date.now().toString(),
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: paymentCard,
      buyer: {
        id: userId || 'guest_' + Date.now().toString(),
        name: shippingAddress.contactName.split(' ')[0] || 'Misafir',
        surname: shippingAddress.contactName.split(' ').slice(1).join(' ') || 'Kullanıcı',
        gsmNumber: '+905555555555',
        email: guestEmail || 'test@test.com',
        identityNumber: '74300864791',
        lastLoginDate: '2023-01-01 12:00:00',
        registrationDate: '2023-01-01 12:00:00',
        registrationAddress: shippingAddress.address,
        ip: '85.34.78.112',
        city: shippingAddress.city,
        country: shippingAddress.country,
        zipCode: shippingAddress.zipCode || '34000'
      },
      shippingAddress: shippingAddress,
      billingAddress: shippingAddress,
      basketItems: basketItems
    };

    iyzipay.payment.create(request, async (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'İyzico sunucusuna ulaşılamadı.', error: err });
      }

      if (result.status === 'success') {
        // userId burada kayıt ediliyor, artık admin panelinde isimler görünecek
        const newOrder = new Order({
          user: userId ? userId : null, 
          guestEmail: guestEmail,
          items: items,
          totalAmount: finalTotal,
          shippingAddress: shippingAddress,
          status: 'Hazırlanıyor',
          iyzicoPaymentId: result.paymentId
        });

        await newOrder.save();

        for (const item of items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity }
          });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Ödeme başarılı!', 
          orderId: newOrder._id 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: result.errorMessage 
        });
      }
    });
  } catch (error) {
    console.error('Ödeme Algoritması Hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
  }
};