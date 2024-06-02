const {SlashCommandBuilder, EmbedBuilder, messageLink} = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    generateDependencyReport
} = require('@discordjs/voice');

const download = require('../../utils/music');
const path = require('path');
require('libsodium-wrappers');

const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca uma música')
    .addStringOption(option =>
        option.setName('url')
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

    await interaction.reply({embeds: [embed]});

    const url = interaction.options.getString('url');

    if (!interaction.member.voice.channel) {
        return interaction.reply('Você precisa estar em um canal de voz para usar esse comando!');
    }

    try {
        const downloadResult = await download(url);
        const musicPath = downloadResult.filePath;
        const musica = downloadResult.musica;

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

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Playback finished.');
            connection.destroy();
        });

        connection.subscribe(player);

        const resource = createAudioResource(path.resolve(musicPath));
        player.play(resource);

        const tocando  = new EmbedBuilder()
            .setTitle("Tocando")
            .setDescription(`[${musica.nome}](${musica.url})`)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setThumbnail(musica.capa)
            .setColor(0x57F287)

        interaction.editReply({embeds: [tocando]});
    } catch (error) {
        console.error(`Erro ao executar o comando play: ${error}`);
        interaction.reply('Houve um erro ao tentar reproduzir a música.');
    }
}

module.exports = {data, execute};
