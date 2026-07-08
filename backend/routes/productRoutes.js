const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Route ayarlamaları
router.route('/')
  .get(getProducts) // Herkes GET atabilir
  .post(protect, adminOnly, createProduct); // Sadece token'ı olan ve admin olan POST atabilir

router.route('/:id')
  .get(getProductById);

module.exports = router;