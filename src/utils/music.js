const ytdl = require("@distube/ytdl-core");
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const ytsr = require('ytsr');
const getVideoInfo = require('../services/Video');

const cache = {musicDict: {}};

class Music {
    constructor(nome, autor, audioFile, duracao, capa, id, url) {
        this.nome = nome;
        this.autor = autor;
        this.audioFile = audioFile;
        this.duracao = duracao;
        this.capa = capa;
        this.id = id;
        this.url = url;
    }
}

async function download(videoUrl) {
    try {
        const info = await getVideoInfo(getVideoId(videoUrl));
        //const info = await ytsr(videoUrl, {limit: 1, gl: 'BR'});
        const id = info.id;
        const nome = info.snippet.title;
        const autor = info.snippet.channelTitle;
        const audioFile = `${id}.mp3`;
        //const duracao = convertDurationToSeconds(info.items[0].duration);
        const duracao = convertISO8601ToSeconds(info.contentDetails.duration);
        const capa = info.snippet.thumbnails.high.url;
        const musica = new Music(nome, autor, audioFile, duracao, capa, id, videoUrl);

        return new Promise((resolve, reject) => {
            const worker = new Worker(path.join(__dirname, 'downloadWorker.js'), {
                workerData: { videoUrl, audioFile }
            });
            worker.on('message', (message) => {
                if (message.error) {
                    reject(message.error);
                } else {
                    saveMusic(musica);
                    resolve(musica);
                }
            });
            worker.on('error', (error) => {
                reject(error);
            });
        });
    } catch (error) {
        console.error(`Erro na função download: ${error} \n musica: ${videoUrl}`);
        return null;
    }
}



function saveMusic(music) {
    try {
        if (!(music instanceof Music)) {
            throw new Error("O objeto passado não é uma instância de Music");
        }

        // Adicionar o objeto music ao dicionário usando o id como chave
        cache.musicDict[music.id] = music;

        // Converter o objeto JavaScript atualizado de volta para JSON
        const updatedMusicData = JSON.stringify(cache.musicDict, null, 2);
        const infoFile = path.join(__dirname, '../../infoMusicas.json');

        // Escrever o JSON atualizado de volta para o arquivo
        fs.writeFileSync(infoFile, updatedMusicData, 'utf8');
        console.log("[MUSIC CACHE] Música salva com sucesso!");
    } catch (error) {
        console.error(`[MUSIC CACHE] Erro ao salvar a música: ${error}`);
        throw error;
    }
}

async function isDownloaded(url) {
    const id = getVideoId(url);
    const musica = cache.musicDict[id];
    return musica ? musica : false;
}

function convertISO8601ToSeconds(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let hours = 0, minutes = 0, seconds = 0;

    if (match[1]) hours = parseInt(match[1].slice(0, -1));
    if (match[2]) minutes = parseInt(match[2].slice(0, -1));
    if (match[3]) seconds = parseInt(match[3].slice(0, -1));

    return hours * 3600 + minutes * 60 + seconds;
}

function getVideoId(url) {
    if (!url) {
        throw new Error("URL não pode ser undefined ou null");
    }
    const regex = /[?&]v=([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function loadMusicCache() {
    try {
        const infoFile = path.join(__dirname, '../../infoMusicas.json');
        if (fs.existsSync(infoFile)) {
            const musicData = fs.readFileSync(infoFile, 'utf8');
            cache.musicDict = JSON.parse(musicData);
            console.log("[MUSIC CACHE] Cache de músicas carregado com sucesso!");
        } else {
            console.log("[MUSIC CACHE] Arquivo de cache de músicas não encontrado. Criando um novo.");
            fs.writeFileSync(infoFile, '{}', 'utf8');
        }
    } catch (error) {
        console.error(`[MUSIC CACHE] Erro ao carregar o cache de músicas: ${error}`);
        throw error;
    }
}

function convertDurationToSeconds(duration) {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
}


module.exports = {download, loadMusicCache, cache, getVideoId};
