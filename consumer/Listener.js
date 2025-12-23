class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlistData = await this._playlistService.getPlaylist(playlistId);
      
      const playlist = {
        id: playlistData[0].id,
        name: playlistData[0].name,
        songs: playlistData.map((row) => ({
          id: row.song_id,
          title: row.title,
          performer: row.performer,
        })).filter(song => song.id), 
      };

      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify({ playlist }));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;