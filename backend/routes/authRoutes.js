const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  changePassword, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// YENİ EKLENEN ROTALAR
router.post('/change-password', protect, changePassword); // Şifre değiştirme (sadece giriş yapmışlar)
router.post('/forgot-password', forgotPassword);          // Şifremi unuttum mail talebi
router.post('/reset-password', resetPassword);            // Linke tıklayınca yeni şifre belirleme

module.exports = router;