const axios = require('axios');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiration = null;
  }

  async getAccessToken() {
    // Kiểm tra nếu token hiện tại vẫn còn hiệu lực
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Đặt thời gian hết hạn (thường là 1 giờ = 3600 giây)
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  async searchTracks(query, limit = 20) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      return response.data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        album_art: track.album.images[0]?.url,
        duration: track.duration_ms,
        preview_url: track.preview_url,
        spotify_url: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error searching Spotify tracks:', error);
      throw error;
    }
  }

  async getPlaylistTracks(playlistId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      return response.data.items.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album.name,
        album_art: item.track.album.images[0]?.url,
        duration: item.track.duration_ms,
        preview_url: item.track.preview_url,
        spotify_url: item.track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error getting Spotify playlist tracks:', error);
      throw error;
    }
  }
}

module.exports = new SpotifyService();