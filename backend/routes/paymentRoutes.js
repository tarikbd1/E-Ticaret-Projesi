const express = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/paymentController');

// POST /api/payments/pay rotası - Frontend'in ödeme isteğini attığı kapı
router.post('/pay', createPayment);

module.exports = router;