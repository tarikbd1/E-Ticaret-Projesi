const Ticket = require('../models/Ticket');

// 📥 1. TÜM BİLETLERİ GETİR (Ekranda listelemek için)
exports.getTickets = async (req, res) => {
  try {
    // En son açılan ticket en üstte gelsin diye sort ekledik
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Destek talepleri getirilemedi.' });
  }
};

// 🚀 2. BİLET GÜNCELLE (Yanıt Gönderme ve Durum Değiştirme)
exports.updateTicket = async (req, res) => {
  try {
    const { reply, status } = req.body;
    
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { reply, status },
      { new: true, runValidators: true } // new: true, güncel veriyi hemen döndürür
    );

    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Destek talebi bulunamadı.' });
    }

    res.status(200).json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası: İşlem yapılamadı.' });
  }
};

// 🗑️ 3. BİLET SİLME
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Destek talebi bulunamadı.' });
    }

    res.status(200).json({ success: true, message: 'Destek talebi başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası: Bilet silinemedi.' });
  }
};