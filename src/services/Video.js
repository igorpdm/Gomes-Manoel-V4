const { google } = require('googleapis');
const youtube = google.youtube('v3');
const { apiKey } = require("../config.json")



// Função para buscar informações de um vídeo a partir do link
async function getVideoInfo(videoId) {
  if (!videoId) {
    console.error('Video ID could not be extracted from the URL.');
    return;
  }

  try {
    const response = await youtube.videos.list({
      key: apiKey,
      part: 'snippet,contentDetails',
      id: videoId
    });

    const video = response.data.items[0];
    if (video) {
        return video;
    } else {
      console.error('No video found with the given ID.');
    }
  } catch (error) {
    console.error('Error fetching video information:', error);
  }
}

module.exports = getVideoInfo;