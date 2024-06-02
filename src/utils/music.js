const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

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
        const info = await ytdl.getInfo(videoUrl);
        const id = info.videoDetails.videoId;
        const nome = info.videoDetails.title;
        const autor = info.videoDetails.author.name;
        const audioFile = `${id}.mp3`;
        const duracao = info.videoDetails.lengthSeconds;
        const capa = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
        const url = info.videoDetails.video_url;
        const musica = new Music(nome, autor, audioFile, duracao, capa, id, url);

        const filePath = path.join(__dirname, "../musicas", audioFile);

        return new Promise((resolve, reject) => {
            ytdl(videoUrl, {quality: "highestaudio"})
                .pipe(fs.createWriteStream(filePath))
                .on('finish', () => {
                    saveMusic(musica);
                    resolve({musica, filePath});
                })
                .on('error', reject);
        });
    } catch (error) {
        console.error(`Erro ao obter informações do vídeo: ${error}`);
        throw error;
    }
}

function saveMusic(music) {
    try {
        if (!music instanceof Music) {
            throw new Error("O objeto passado não é uma instância de Music");
        }
        const infoFile = path.join(__dirname, "../../infoMusicas.json");

        let musicDict = {};
        if (fs.existsSync(infoFile)) {
            const musicData = fs.readFileSync(infoFile, 'utf8');
            musicDict = JSON.parse(musicData);
        }

        // Adicionar o objeto music ao dicionário usando o id como chave
        musicDict[music.id] = music;

        // Converter o objeto JavaScript atualizado de volta para JSON
        const updatedMusicData = JSON.stringify(musicDict, null, 2);

        // Escrever o JSON atualizado de volta para o arquivo
        fs.writeFileSync(infoFile, updatedMusicData, 'utf8');
        console.log("[MUSIC CACHE] Música salva com sucesso!")
    } catch (error) {
        console.error(`[MUSIC CACHE] Erro ao salvar a música: ${error}`);
        throw error;
    }
}

module.exports = download;
