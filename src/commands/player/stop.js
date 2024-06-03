const { getVoiceConnection } = require('@discordjs/voice');
const queue = require('../../shared/queue');
const {SlashCommandBuilder, EmbedBuilder, messageLink} = require('discord.js');
const { state } = require('./play');

const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para a reprodução da música e limpa a fila');

async function execute(interaction) {
    const stopEmbed = new EmbedBuilder()
        .setTitle("Stop")
        .setDescription("A reprodução da música foi interrompida e a fila foi limpa.")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setThumbnail(interaction.guild.iconURL())
        .setColor(0x0099FF)
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        return interaction.reply("Não estou tocando nada no momento.");
    }

    const player = connection.state.subscription.player;
    player.stop();
    queue.length = 0;
    state.isPlaying = false;

    connection.destroy();
    return interaction.reply({embeds: [stopEmbed]});
}

module.exports = {data, execute};