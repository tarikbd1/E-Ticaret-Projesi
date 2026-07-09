const Product = require('../models/Product');

// @desc    Tüm ürünleri getir (GET)
// @access  Public (Herkes görebilir)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Yeni ürün ekle (POST)
// @access  Private/Admin (Sadece yöneticiler)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, stock } = req.body;
    
    const product = new Product({
      name, description, price, image, stock,
      user: req.user._id // protect middleware'inden gelen giriş yapmış adminin ID'si
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tek bir ürünü ID ile getir
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Geçersiz ID formatı veya sunucu hatası' });
  }
};

// Dışa aktarma kısmına getProductById'yi de eklemeyi unutma:
module.exports = { getProducts, createProduct, getProductById };