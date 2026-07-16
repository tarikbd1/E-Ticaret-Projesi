const Order = require('../models/Order');

// Şimdilik sadece boş bir liste döndürelim ki sistem çökmesin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Siparişler getirilemedi.' });
  }
};