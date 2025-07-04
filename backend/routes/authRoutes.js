const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

router.post('/register', authController.register);

module.exports = router;