const supabase = require('../config/supabase');
const axios = require('axios');
const spotifyService = require('../services/spotifyService');

// Lấy danh sách playlist
const getPlaylists = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('music_playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy playlist theo workout type
const getPlaylistsByWorkoutType = async (req, res) => {
  try {
    const { workout_type } = req.params;
    
    const { data, error } = await supabase
      .from('music_playlists')
      .select('*')
      .contains('workout_type', [workout_type]);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching playlists by workout type:', error);
    res.status(500).json({ error: error.message });
  }
};

// Tạo playlist mới
const createPlaylist = async (req, res) => {
  try {
    const { name, created_by, workout_type, tracks, duration, external_url } = req.body;
    
    const { data, error } = await supabase
      .from('music_playlists')
      .insert([
        {
          name,
          created_by,
          workout_type,
          tracks,
          duration,
          external_url
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: error.message });
  }
};

// Tìm kiếm nhạc từ Spotify
const searchSpotifyTracks = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
      
    const tracks = await spotifyService.searchTracks(q);
      
      res.status(200).json(tracks);
  } catch (error) {
    console.error('Error searching Spotify tracks:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật sở thích âm nhạc của người dùng
const updateMusicPreferences = async (req, res) => {
  try {
    const { user_id, preferred_genres, preferred_tempo, saved_playlists, connected_services } = req.body;
    
    // Kiểm tra xem người dùng đã có preferences chưa
    const { data: existingData, error: existingError } = await supabase
      .from('music_preferences')
      .select('*')
      .eq('user_id', user_id);
    
    if (existingError) throw existingError;
    
    let data, error;
    
    if (existingData.length > 0) {
      // Update existing preferences
      ({ data, error } = await supabase
        .from('music_preferences')
        .update({
          preferred_genres,
          preferred_tempo,
          saved_playlists,
          connected_services,
          updated_at: new Date()
        })
        .eq('user_id', user_id)
        .select());
    } else {
      // Create new preferences
      ({ data, error } = await supabase
        .from('music_preferences')
        .insert([
          {
            user_id,
            preferred_genres,
            preferred_tempo,
            saved_playlists,
            connected_services
          }
        ])
        .select());
    }

    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating music preferences:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPlaylists,
  getPlaylistsByWorkoutType,
  createPlaylist,
  searchSpotifyTracks,
  updateMusicPreferences
};