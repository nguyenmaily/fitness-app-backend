const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const achievementController = require('../controllers/achievementController');

// Lấy lịch sử thành tích của người dùng
router.get('/user/:user_id', auth, achievementController.getUserAchievements);

// Thêm thành tích mới
router.post('/', auth, achievementController.createAchievement);

// Chia sẻ thành tích
router.post('/share', auth, achievementController.shareAchievement);

module.exports = router;