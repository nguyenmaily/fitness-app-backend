const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const challengeController = require('../controllers/challengeController');

// Lấy danh sách thử thách
router.get('/', auth, challengeController.getChallenges);

// Tham gia thử thách
router.post('/join', auth, challengeController.joinChallenge);

// Lấy bảng xếp hạng của một thử thách
router.get('/:challenge_id/leaderboard', auth, challengeController.getChallengeLeaderboard);

// Lấy danh sách huy hiệu của người dùng
router.get('/badges/user/:user_id', auth, challengeController.getUserBadges);

module.exports = router;