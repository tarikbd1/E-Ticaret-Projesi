const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET /api/orders/stats - Admin Dashboard İstatistiklerini Getir (YENİ EKLENEN MOTOR)
router.get('/stats', async (req, res) => {
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
});

// GET /api/orders - Admin için tüm siparişleri getir
router.get('/', async (req, res) => {
  try {
    // populate ile siparişi veren kullanıcının adını ve e-postasını da çekiyoruz
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Siparişler getirilemedi.' });
  }
});

// GET /api/orders/my-orders/:userId - Sadece giriş yapan kullanıcının kendi siparişlerini getir
router.get('/my-orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Sadece o user ID'sine ait siparişleri bul ve tarihe göre tersten sırala
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Siparişleriniz yüklenirken bir hata oluştu.' });
  }
});

// PUT /api/orders/:id - Adminin sipariş durumunu güncellemesi
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Bekliyor', 'Hazırlanıyor', 'Kargolandı', 'Teslim Edildi', 'İptal Edildi'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz sipariş durumu.' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Sipariş bulunamadı.' });
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sipariş durumu güncellenirken hata oluştu.' });
  }
});

module.exports = router;