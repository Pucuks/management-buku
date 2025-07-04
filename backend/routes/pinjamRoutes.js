const express = require('express');
const router = express.Router();
const controller = require('../controllers/pinjamController');

// Endpoint untuk peminjaman
router.post('/', controller.create);
router.get('/history', controller.history);
router.put('/kembalikan/:id', controller.kembalikan);
router.get('/stock/:bookId', controller.checkStock);

module.exports = router;