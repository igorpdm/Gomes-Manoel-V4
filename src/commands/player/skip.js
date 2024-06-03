const {SlashCommandBuilder, EmbedBuilder, messageLink} = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const queue = require('../../shared/queue');
const {playNext} = require('./play');


const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula para a próxima música na fila')

async function execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        return interaction.reply("Não estou tocando nada no momento.");
    }else if(queue.length === 0){
        return interaction.reply("Não há músicas na fila.");
    }

    const player = connection.state.subscription.player;
    player.stop();

    await playNext(interaction, connection, player, "skip");
}

module.exports = {data, execute};