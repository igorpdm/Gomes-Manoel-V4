const {SlashCommandBuilder, EmbedBuilder, messageLink} = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const queue = require('../../shared/queue');

const data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Retoma a reprodução da música atual')

async function execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        return interaction.reply("Não estou tocando nada no momento.");
    }

    const player = connection.state.subscription.player;
    player.unpause();

    const embed = new EmbedBuilder()
        .setTitle("Música retomada")
        .setDescription("A música foi retomada com sucesso.")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setThumbnail(interaction.guild.iconURL())
        .setColor(0x0099FF)

    await interaction.reply({embeds: [embed]});
}

module.exports = {
    data,
    execute
}