const { google } = require('googleapis');
const youtube = google.youtube('v3');
const { apiKey } = require("../../config.json")

async function getPlaylist(playlistUrl) {
  let playlistId = getPlaylistID(playlistUrl);
  let nextPageToken = '';
  const videos = [];

  try {
    do {
      const response = await youtube.playlistItems.list({
        key: apiKey,
        part: 'snippet',
        playlistId: playlistId,
        maxResults: 50, // Máximo permitido pela API é 50
        pageToken: nextPageToken
      });

      response.data.items.forEach(item => {
        videos.push(`https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`);
      });

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    console.log(`Total videos: ${videos.length}`);
    return videos;
  } catch (error) {
    console.error('Error listing playlist videos:', error);
  }
}

function getPlaylistID(url) {
    const regex = /[?&]list=([a-zA-Z0-9_-]{34})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

module.exports = getPlaylist;