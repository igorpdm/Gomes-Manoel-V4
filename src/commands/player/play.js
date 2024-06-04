const {SlashCommandBuilder, EmbedBuilder, messageLink} = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    generateDependencyReport
} = require('@discordjs/voice');

const path = require('path');
const {download} = require('../../utils/music');
require('libsodium-wrappers');
const queue = require('../../shared/queue');
const {cache, getVideoId} = require('../../utils/music')
const ytpl = require('ytpl');
const ytsr = require('ytsr')
const searchVideo = require('../../services/Search')

let state = {isPlaying: false}
let currentMusic = {musica: null, startTime: null}

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca uma música')
    .addStringOption(option =>
        option.setName('query')
            .setDescription('URL do vídeo ou playlist do YouTube')
            .setRequired(true)
    );

async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setTitle("Carregando")
        .setDescription("Carregando a música. Por favor, aguarde...")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setThumbnail(interaction.guild.iconURL())
        .setColor(0x0099FF)

    const url = interaction.options.getString('query');

    if (!interaction.member.voice.channel) {
        return interaction.reply('Você precisa estar em um canal de voz para usar esse comando!');
    }

    if (url.includes("v=") && !url.includes("list=")) {
        await interaction.reply({embeds: [embed]});
        await playMusic(interaction, url);
    } else if (url.includes("list=")) {
        let id = await ytpl.getPlaylistID(url)
        let videos = await ytpl(id, {limit: 1000})
        await playPlaylist(interaction, videos, url)
    } else {
        await interaction.reply({embeds: [embed]});
        //let searchResult = await ytsr(url, {limit: 1, gl: 'BR'})
        //let videoUrl = searchResult.items[0].url
        let videoUrl = await searchVideo(url);
        await playMusic(interaction, videoUrl);
    }
}

function formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function playMusic(interaction, url) {
    try {
        let id = getVideoId(url)
        let musica;
        if (cache.musicDict[id]) {
            musica = cache.musicDict[id]
        } else {
            musica = await download(url);
        }

        queue.push(musica);

        if (!state.isPlaying) {
            const channel = interaction.member.voice.channel;

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('The bot has connected to the channel!');
            });

            const player = createAudioPlayer();

            player.on(AudioPlayerStatus.Idle, async () => {
                console.log('Playback finished.');
                if (queue.length > 0) {
                    await playNext(interaction, connection, player, "play2");
                } else {
                    state.isPlaying = false;
                    connection.destroy();
                }
            });

            connection.subscribe(player);

            await playNext(interaction, connection, player, "play");
        } else {
            const addedToQueueEmbed = new EmbedBuilder()
                .setTitle("🎵 Adicionado à fila")
                .setDescription(`\`${formatDuration(musica.duracao)}\` [${musica.nome}](${musica.url})`)
                .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
                .setThumbnail(musica.capa)
                .setColor(0x57F287)
                .setFooter({text: `Posição na fila: ${queue.length}`, iconUrl: interaction.guild.iconURL()});

            await interaction.editReply({embeds: [addedToQueueEmbed]});
        }
    } catch (error) {
        const erroEmbed = new EmbedBuilder()
            .setTitle("Erro")
            .setDescription("Ocorreu um erro ao tocar a música.\n Verifique se a música possúi restrições de idade ou se o link é válido.")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setThumbnail(interaction.guild.iconURL())
            .setColor(0xFF0000);
        await interaction.editReply({embeds: [erroEmbed]});
        console.error(`Erro ao executar o comando play: ${error}`);
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playPlaylist(interaction, videos, url) {
    try {
        console.log('Iniciando o carregamento da playlist');

        const embed = new EmbedBuilder()
            .setTitle("Carregando Playlist")
            .setDescription("Carregando a playlist. Por favor, aguarde...")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setThumbnail(interaction.guild.iconURL())
            .setColor(0x0099FF);

        await interaction.reply({embeds: [embed]});

        let isFirst = true;

        for (const video of videos.items) {
            try {
                if (isFirst) {
                    await playMusic(interaction, video.shortUrl);
                    isFirst = false;
                } else {
                    let id = video.id;
                    if (cache.musicDict[id]) {
                        queue.push(cache.musicDict[id]);
                    } else {
                        const musica = await download(video.shortUrl);
                        if (musica != null) {
                            queue.push(musica);
                            //await sleep(500);
                        }
                    }
                }
            } catch (error) {
                console.error(`Erro ao baixar o vídeo: ${error}`);
                // Você pode adicionar mais lógica de tratamento de erro aqui, se necessário
            }
        }

        // Esperar que todos os downloads sejam concluídos
        // await Promise.all(downloadPromises);

        console.log('Todos os vídeos da playlist foram baixados');
        if(state.isPlaying){
            const playlistEmbed = new EmbedBuilder()
            .setTitle("🎵 Playlist Adicionada")
            .setDescription(`${videos.items.length} músicas da [playlist](${url}) foram adicionados à fila!`)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setThumbnail(interaction.guild.iconURL())
            .setColor(0x57F287)

        await interaction.editReply({embeds: [playlistEmbed]});
        }else{
            queue.length = 0;
        }
    } catch (error) {
        console.error(`Erro ao tocar a playlist: ${error}`);
    }
}


async function playNext(interaction, connection, player, command) {
    if (queue.length === 0) {
        state.isPlaying = false;
        connection.destroy();
        return;
    }

    currentMusic.musica = queue.shift();
    const musicPath = path.join(__dirname, `../../musicas/${currentMusic.musica.audioFile}`);
    const resource = createAudioResource(path.resolve(musicPath));

    player.play(resource);
    currentMusic.startTime = Date.now();
    state.isPlaying = true;

    const tocando = new EmbedBuilder()
        .setTitle("🎵 Tocando")
        .setDescription(`\`${formatDuration(currentMusic.musica.duracao)}\` [${currentMusic.musica.nome}](${currentMusic.musica.url})`)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setThumbnail(currentMusic.musica.capa)
        .setColor(0x57F287);

    const pulando = new EmbedBuilder()
        .setTitle("🎵 Pulando")
        .setDescription(`\`${formatDuration(currentMusic.musica.duracao)}\` [${currentMusic.musica.nome}](${currentMusic.musica.url})`)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setThumbnail(currentMusic.musica.capa)
        .setColor(0x57F287);
    if (command === "play") {
        await interaction.editReply({embeds: [tocando]});
    } else if (command === "play2") {
        await interaction.followUp({embeds: [tocando]});
    } else {
        await interaction.reply({embeds: [pulando]});
    }
}

module.exports = {data, execute, state, playNext, currentMusic, formatDuration};
