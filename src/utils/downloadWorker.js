const { parentPort, workerData } = require('worker_threads');
const ytdl = require("@distube/ytdl-core");
const fs = require('fs');
const path = require('path');

const { videoUrl, audioFile } = workerData;

const filePath = path.join(__dirname, "../musicas", audioFile);
const stream = ytdl(videoUrl, { filter: 'audioonly' });

stream.on('error', (error) => {
    parentPort.postMessage({ error });
});

stream.pipe(fs.createWriteStream(filePath))
    .on('finish', () => {
        parentPort.postMessage({ success: true });
    })
    .on('error', (error) => {
        parentPort.postMessage({ error });
    });
