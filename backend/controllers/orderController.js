const Order = require('../models/Order');

// 1. Mevcut Siparişleri Getirme Fonksiyonu
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Siparişler getirilemedi.' });
  }
};

// 2. Admin Panel İstatistikleri İçin Motor
exports.getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalItemsSold = 0;

    orders.forEach(order => {
      totalRevenue += (order.totalAmount || 0);

      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          totalItemsSold += (item.quantity || 1);
        });
      }
    });

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

// 3. YENİ EKLENEN: Sipariş Silme Motoru
exports.deleteOrder = async (req, res) => {
  try {
    // URL'den gelen ID parametresine göre siparişi bul ve veritabanından yok et
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Silinecek sipariş bulunamadı.' });
    }

    res.status(200).json({ success: true, message: 'Sipariş başarıyla silindi.' });
  } catch (error) {
    console.error("Sipariş silme hatası:", error);
    res.status(500).json({ success: false, message: 'Sipariş silinirken sunucu hatası oluştu.' });
  }
};