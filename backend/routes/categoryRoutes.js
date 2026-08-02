const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// 1. Tüm Kategorileri Getir (GET)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // A'dan Z'ye sıralı gelsin
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Kategoriler getirilirken sunucu hatası.' });
  }
});

// 2. Yeni Kategori Ekle (POST)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Kategori adı zorunludur.' });

    const newCategory = new Category({ name });
    await newCategory.save();
    
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Bu kategori zaten mevcut!' });
    }
    res.status(500).json({ success: false, message: 'Kategori eklenemedi.' });
  }
});

// 3. Kategoriyi Güncelle (PUT)
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { returnDocument: 'after' }
    );
    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Kategori güncellenemedi.' });
  }
});

// 4. Kategoriyi Sil (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Kategori başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Kategori silinemedi.' });
  }
});

module.exports = router;