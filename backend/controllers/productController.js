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
    const { name, description, price, image, images, stock } = req.body;
    
    // 🚀 YENİ: Ekstra resimleri (images) virgülle ayrılmış string gelirse diziye çevir
    let imagesArray = [];
    if (images) {
      if (Array.isArray(images)) {
        imagesArray = images;
      } else if (typeof images === 'string') {
        // Virgülle böl, sağ/sol boşlukları temizle, boş olanları sil
        imagesArray = images.split(',').map(url => url.trim()).filter(url => url !== '');
      }
    }
    
    const product = new Product({
      name, description, price, image, 
      images: imagesArray, // 🚀 Diziye çevrilmiş ekstra resimler
      stock,
      user: req.user._id // protect middleware'inden gelen giriş yapmış adminin ID'si
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tek bir ürünü ID ile getir (GET)
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

// @desc    Ürünü Sil (DELETE)
// @access  Private/Admin (Sadece yöneticiler)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      await product.deleteOne(); // Veritabanından tamamen siler
      res.status(200).json({ success: true, message: 'Ürün sistemden başarıyla silindi' });
    } else {
      res.status(404).json({ success: false, message: 'Silinecek ürün bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ürünü Güncelle (PUT)
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // 🚀 YENİ: Güncellemede de virgülle ayrılmış ekstra resim gelirse diziye çevir
    if (updateData.images && typeof updateData.images === 'string') {
      updateData.images = updateData.images.split(',').map(url => url.trim()).filter(url => url !== '');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Düzenlenecek ürün bulunamadı.' });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ürün güncellenirken sunucu hatası oluştu.' });
  }
};

// Tüm fonksiyonları dışa aktarıyoruz
module.exports = {
  getProducts,
  createProduct,
  getProductById,
  deleteProduct,
  updateProduct 
};