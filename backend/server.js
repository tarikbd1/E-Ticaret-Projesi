const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // YENİ EKLENDİ

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // YENİ EKLENDİ
app.use('/api/tickets', require('./routes/ticketRoutes'));

app.get('/', (req, res) => {
  res.send('E-Ticaret API Tıkır Tıkır Çalışıyor...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda ayaklandı gardaş!`);
});