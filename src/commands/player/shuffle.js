const { getVoiceConnection } = require("@discordjs/voice");
const queue = require("../../shared/queue");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("shuffle")
  .setDescription("Embaralha a fila de músicas");

async function execute(interaction) {
  const connection = getVoiceConnection(interaction.guildId);

  if (!connection) {
    const embed = new EmbedBuilder()
      .setTitle("Não estou tocando nenhuma música!")
      .setColor(0x0099ff)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.avatarURL(),
      })
      .setThumbnail(interaction.client.user.displayAvatarURL());

    return interaction.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setTitle("Shuffle")
    .setDescription("A fila de músicas foi embaralhada!")
    .setColor(0x0099ff)
    .setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.avatarURL(),
    })
    .setThumbnail(interaction.client.user.displayAvatarURL());

  queue.sort(() => Math.random() - 0.5);
  return interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
