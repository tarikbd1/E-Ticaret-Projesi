const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productController');

// DÜZELTME: Senin yazdığın adminOnly fonksiyonunu çağırıyoruz
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// POST işlemine protect ve adminOnly korumalarını zincirliyoruz
router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

module.exports = router;