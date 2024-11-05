const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// 인증 라우트
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;