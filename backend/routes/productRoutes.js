const express = require('express');
const router = express.Router();

// ÇÖZÜM BURADA: deleteProduct'ı bu süslü parantezlerin içine ekledik
const { 
  getProducts, 
  createProduct, 
  getProductById, 
  deleteProduct 
} = require('../controllers/productController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .delete(protect, adminOnly, deleteProduct); // Artık burası sorunsuz çalışacak

module.exports = router;