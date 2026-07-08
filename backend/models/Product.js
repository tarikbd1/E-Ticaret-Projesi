const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  images: [{ type: String }], // Birden fazla resim URL'si tutabilmek için dizi
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);