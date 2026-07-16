const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Bu email zaten kullanımda!' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 2. LOGIN (Güncellendi: Her başarılı girişte sayaç artacak)
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      
      // GİRİŞ BAŞARILIYSA SAYACI 1 ARTIR VE KAYDET
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save({ validateBeforeSave: false });

      res.json({ 
        success: true, 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        token: generateToken(user._id) 
      });
    } else {
      res.status(401).json({ success: false, message: 'Geçersiz email veya şifre!' });
    }
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 3. PROFILE (Güncellendi: Artık statik 18 değil, gerçek sayacı dönecek)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ 
        success: true, 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        createdAt: user.createdAt, 
        loginCount: user.loginCount
      });
    } else {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


// 4. ŞİFRE DEĞİŞTİRME (DASHBOARD İÇİN)
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Eski şifre doğru mu kontrol et
    if (!(await user.matchPassword(req.body.oldPassword))) {
      return res.status(400).json({ success: false, message: 'Mevcut şifrenizi yanlış girdiniz!' });
    }
    // Yeni şifreyi ata ve kaydet (pre-save middleware otomatik hashleyecek)
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Şifreniz başarıyla güncellendi' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 5. ŞİFREMİ UNUTTUM (MAİL GÖNDERME SİMÜLASYONU)
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı!' });
    }

    // Jetonu oluştur ve geçici olarak veri tabanına kaydet
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Kullanıcının tıklayacağı arayüz linki
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    // Modern ve koyu temalı HTML şablonu
    const message = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; padding: 40px 20px; color: #f8fafc; text-align: center; margin: 0;">
        <div style="max-width: 450px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 40px 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #9333ea); border-radius: 16px; margin: 0 auto 20px auto; line-height: 60px; font-size: 24px;">
            🔐
          </div>

          <h2 style="color: #ffffff; margin-top: 0; margin-bottom: 15px; font-size: 22px; font-weight: 800;">Şifrenizi Sıfırlayın</h2>
          
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            Sayın ${user.name}, hesabınız için şifre sıfırlama talebi aldık. Güvenliğiniz için bu bağlantı <strong>10 dakika</strong> içinde geçersiz olacaktır.
          </p>
          
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 12px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);">
            Yeni Şifre Belirle
          </a>
          
          <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #1e293b;">
            <p style="color: #475569; font-size: 12px; margin: 0; line-height: 1.5;">
              Eğer bu talebi siz yapmadıysanız, hesabınız güvendedir ve bu mesajı görmezden gelebilirsiniz.<br><br>
              © 2026 E-Ticaret Sistemi
            </p>
          </div>
        </div>
      </div>
    `;

    // MAİL GÖNDERİM DENEMESİ
    try {
      await sendEmail({
        email: user.email,
        subject: '🔑 Hesabınız İçin Şifre Sıfırlama Talebi',
        message: message
      });

      res.status(200).json({ success: true, message: 'Şifre sıfırlama bağlantısı e-postanıza gönderildi.' });
      
    } catch (error) {
      // DÜZELTİLEN KISIM: Eğer mail sunucusu hata verirse, oluşturduğumuz jetonları temizliyoruz ki açık kalmasın
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error("MAIL GÖNDERİM HATASI DETAYI:", error);
      return res.status(500).json({ success: false, message: 'E-posta gönderilemedi.' });
    }

  } catch (error) { 
    console.error("GENEL HATA:", error);
    res.status(500).json({ success: false, message: error.message }); 
  }
};

// 6. ŞİFRE SIFIRLAMA (YENİ ŞİFREYİ BELİRLEME)
const resetPassword = async (req, res) => {
  try {
    // Linkten gelen orijinal jetonu hashleyip veri tabanındakiyle karşılaştıracağız
    const resetPasswordToken = crypto.createHash('sha256').update(req.body.token).digest('hex');

    // Jetonu eşleşen ve süresi (10 dk) geçmemiş kullanıcıyı bul
    const user = await User.findOne({ 
      resetPasswordToken, 
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı!' });

    // Yeni şifreyi ata ve jetonları temizle
    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Şifreniz başarıyla sıfırlandı' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { registerUser, loginUser, getUserProfile, changePassword, forgotPassword, resetPassword };