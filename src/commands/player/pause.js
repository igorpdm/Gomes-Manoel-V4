const {SlashCommandBuilder, EmbedBuilder, messageLink} = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const queue = require('../../shared/queue');

const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a reprodução da música atual')

async function execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        return interaction.reply("Não estou tocando nada no momento.");
    }

    const player = connection.state.subscription.player;
    player.pause();

    const embed = new EmbedBuilder()
        .setTitle("Música pausada")
        .setDescription("A música foi pausada com sucesso.")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setThumbnail(interaction.guild.iconURL())
        .setColor(0x0099FF)

    await interaction.reply({embeds: [embed]});
}

module.exports = {data, execute};