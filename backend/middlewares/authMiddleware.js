const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Sisteme giriş yapılmış mı kontrolü
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Şifre hariç kullanıcı bilgilerini req.user içine atıyoruz
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim, token geçersiz!' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token bulunamadı, giriş yapmalısınız!' });
  }
};

// Kullanıcı Admin mi kontrolü
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Adminsin, geçebilirsin
  } else {
    return res.status(403).json({ success: false, message: 'Bu işlem için Admin yetkisi gerekiyor!' });
  }
};

module.exports = { protect, adminOnly };