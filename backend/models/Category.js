const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Aynı kategoriden 2 tane olmasın diye
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);