const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// POST /api/tickets - Yeni bir destek talebi (Ticket) oluşturma
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Lütfen tüm alanları doldurun.' });
    }

    const newTicket = await Ticket.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Destek talebi oluşturulurken sunucu hatası oluştu.' });
  }
});

// GET /api/tickets - Admin için tüm ticketları getirme
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ticketlar getirilemedi.' });
  }
});

// 🚀 PUT /api/tickets/:id - Adminin ticket durumunu VE YANITINI güncellemesi
router.put('/:id', async (req, res) => {
  try {
    const { status, reply } = req.body; // Frontend'den hem durumu hem yanıtı alıyoruz
    
    // Güvenlik Duvarı: İzin verilen durumların listesi (Cevaplandı EKLENDİ)
    if (status && !['Açık', 'İnceleniyor', 'Cevaplandı', 'Kapatıldı'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum bilgisi.' });
    }

    // Güncellenecek verileri hazırlayalım (Eğer reply geldiyse onu da ekle)
    const updateData = {};
    if (status) updateData.status = status;
    if (reply !== undefined) updateData.reply = reply; 

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Ticket bulunamadı.' });
    }

    res.status(200).json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ticket durumu güncellenirken hata oluştu.' });
  }
});

// 🗑️ DELETE /api/tickets/:id - Adminin ticket silmesi
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket bulunamadı.' });
    }

    res.status(200).json({ success: true, message: 'Ticket başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ticket silinirken hata oluştu.' });
  }
});

module.exports = router;