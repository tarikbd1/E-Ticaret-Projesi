const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen adınızı girin']
  },
  email: {
    type: String,
    required: [true, 'Lütfen e-posta adresinizi girin']
  },
  subject: {
    type: String,
    required: [true, 'Lütfen konuyu belirtin']
  },
  message: {
    type: String,
    required: [true, 'Lütfen mesajınızı yazın']
  },
  status: {
    type: String,
    enum: ['Açık', 'İnceleniyor', 'Kapatıldı'],
    default: 'Açık' // Dokümanda adminin ticket durumunu güncelleyeceği belirtilmişti
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);