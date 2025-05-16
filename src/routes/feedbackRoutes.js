const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

// Lấy danh sách phản hồi của người dùng
router.get('/user/:user_id', auth, feedbackController.getUserFeedback);

// Gửi phản hồi (từ huấn luyện viên đến người dùng)
router.post('/send', auth, feedbackController.sendFeedback);

// Gửi media (từ người dùng đến huấn luyện viên) để yêu cầu phản hồi
router.post('/send-media', auth, feedbackController.sendMediaForFeedback);

// Đánh dấu phản hồi đã đọc
router.put('/:feedback_id/read', auth, feedbackController.markFeedbackAsRead);

module.exports = router;