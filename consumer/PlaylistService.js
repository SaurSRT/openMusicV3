const { Pool } = require('pg');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylist(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, songs.id as song_id, songs.title, songs.performer
             FROM playlists
             LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
             LEFT JOIN songs ON songs.id = playlist_songs.song_id
             WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}
module.exports = PlaylistService;