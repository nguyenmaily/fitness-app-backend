const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const musicController = require('../controllers/musicController');

// Lấy danh sách playlist
router.get('/playlists', auth, musicController.getPlaylists);

// Lấy playlist theo workout type
router.get('/playlists/workout/:workout_type', auth, musicController.getPlaylistsByWorkoutType);

// Tạo playlist mới
router.post('/playlists', auth, musicController.createPlaylist);

// Tìm kiếm nhạc từ Spotify
router.get('/search', auth, musicController.searchSpotifyTracks);

// Cập nhật sở thích âm nhạc của người dùng
router.put('/preferences', auth, musicController.updateMusicPreferences);

module.exports = router;