const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  createProduct, 
  getProductById, 
  deleteProduct,
  updateProduct 
} = require('../controllers/productController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct) 
  .delete(protect, adminOnly, deleteProduct); 

module.exports = router;