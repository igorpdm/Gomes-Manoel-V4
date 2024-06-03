const { google } = require('googleapis');
const youtube = google.youtube('v3');
const { apiKey } = require("../config.json")

async function searchVideo(query) {
  try {
    const response = await youtube.search.list({
      key: apiKey,
      part: 'snippet',
      q: query,
      maxResults: 1,
    });

    let videoId = response.data.items[0].id.videoId;
    return "https://www.youtube.com/watch?v=" + videoId;
  } catch (error) {
    console.error('[GOOGLE API] Erro ao buscar vídeo:', error);
  }
}

module.exports = searchVideo;