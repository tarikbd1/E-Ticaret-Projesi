const Order = require('../models/Order');

// 1. Mevcut Siparişleri Getirme Fonksiyonun (Buna dokunmadık)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Siparişler getirilemedi.' });
  }
};

// 2. YENİ EKLENEN: Admin Panel İstatistikleri İçin Motor
exports.getDashboardStats = async (req, res) => {
  try {
    // Tüm siparişleri çekiyoruz
    const orders = await Order.find();

    // Değişkenleri başlatıyoruz
    let totalOrders = orders.length; // Toplam sipariş sayısı
    let totalRevenue = 0;            // Toplam ciro
    let totalItemsSold = 0;          // Satılan toplam ürün adedi

    // Bütün siparişleri tek tek döngüye sokup değerleri topluyoruz
    orders.forEach(order => {
      totalRevenue += (order.totalAmount || 0);

      // Her bir siparişin içindeki sepet ürünlerinin (items) adetlerini topluyoruz
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          totalItemsSold += (item.quantity || 1);
        });
      }
    });

    // Hesaplanan verileri frontend'e gönderiyoruz
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalItemsSold
      }
    });
  } catch (error) {
    console.error("İstatistik hesaplama hatası:", error);
    res.status(500).json({ success: false, message: 'İstatistikler hesaplanırken bir hata oluştu.' });
  }
};