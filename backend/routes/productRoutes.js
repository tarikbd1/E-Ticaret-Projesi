const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  createProduct, 
  getProductById, 
  deleteProduct,
  updateProduct // ÇÖZÜM BURADA: updateProduct'ı içeri aktardık
} = require('../controllers/productController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct) // DÜZENLEME (PUT) İŞLEMİ BURAYA EKLENDİ
  .delete(protect, adminOnly, deleteProduct); 

module.exports = router;