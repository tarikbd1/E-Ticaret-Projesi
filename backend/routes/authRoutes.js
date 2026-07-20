const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  changePassword, 
  forgotPassword, 
  resetPassword,
  addAddress,       
  deleteAddress,
  updateAddress    
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// ŞİFRE İŞLEMLERİ
router.post('/change-password', protect, changePassword); // Şifre değiştirme (sadece giriş yapmışlar)
router.post('/forgot-password', forgotPassword);          // Şifremi unuttum mail talebi
router.post('/reset-password', resetPassword);            // Linke tıklayınca yeni şifre belirleme

// 📍 YENİ EKLENEN ADRES ROTALARI
router.post('/address', protect, addAddress);             // Adres ekleme (sadece giriş yapmışlar)
router.delete('/address/:addressId', protect, deleteAddress); // Adres silme (sadece giriş yapmışlar)
router.put('/address/:addressId', protect, updateAddress);
module.exports = router;