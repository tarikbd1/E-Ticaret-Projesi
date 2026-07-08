const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  title: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  fullAddress: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  loginCount: { type: Number, default: 0 }, // YENİ EKLENEN SATIR
  addresses: [addressSchema],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now }
});

// Kaydetmeden önce şifreyi kriptolama
userSchema.pre('save', async function() { // DÜZELTME 1: Parametreki (next) kelimesini sildik
  if (!this.isModified('password')) {
    return; // DÜZELTME 2: next() yerine sadece return yazarak işlemi bitiriyoruz
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Şifre karşılaştırma
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Şifre sıfırlama jetonu (Token) oluşturma fonksiyonu
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);