const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user: { // Hangi adminin eklediğini takip etmek için
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);