const express = require('express');
const router = express.Router();
// getProductById'yi import içine ekledik
const { getProducts, createProduct, getProductById } = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

// YENİ EKLENEN ROTA: Sadece /:id parametresi alan istekler buraya düşecek
router.route('/:id')
  .get(getProductById);

module.exports = router;