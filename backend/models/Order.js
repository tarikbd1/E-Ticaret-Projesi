const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      productName: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  shippingAddress: {
    address: { type: String },
    city: { type: String }
  },
  status: {
    type: String,
    enum: ['Bekliyor', 'Hazırlanıyor', 'Kargolandı', 'Teslim Edildi', 'İptal Edildi'],
    default: 'Bekliyor'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);