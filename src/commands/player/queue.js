const { getVoiceConnection } = require('@discordjs/voice');
const queue = require('../../shared/queue');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { state } = require('./play');

const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Exibe a fila de músicas');

async function execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        const embed = new EmbedBuilder()
            .setTitle("Erro")
            .setDescription("Não estou conectado a nenhum canal de voz.")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setThumbnail(interaction.guild.iconURL())
            .setColor(0xFF0000);
        return interaction.reply({ embeds: [embed] });
    } else if (queue.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle("Fila de Músicas")
            .setDescription("Não há músicas na fila.")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setThumbnail(interaction.guild.iconURL())
            .setColor(0x0099FF);
        return interaction.reply({ embeds: [embed] });
    }

    const botAvatarURL = interaction.client.user.displayAvatarURL();

    let currentPage = 0;
    const pageSize = 10;

    const totalDuration = queue.reduce((acc, music) => acc + music.duracao, 0);
    const formattedDuration = new Date(totalDuration * 1000).toISOString().substr(11, 8);

    const generateQueueEmbed = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const currentQueue = queue.slice(start, end);
        const embed = new EmbedBuilder()
            .setTitle("Fila de Músicas")
            .setDescription(currentQueue.map((music, index) => `${start + index + 1}. [${music.nome}](${music.url}) - ${music.autor}`).join('\n'))
            .setFooter({ text: `Página ${page + 1} de ${Math.ceil(queue.length / pageSize)} | Tempo estimado: ${formattedDuration}` })
            .setThumbnail(botAvatarURL)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setColor(0x0099FF);

        return embed;
    };

    const queueEmbed = generateQueueEmbed(currentPage);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Anterior')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('close')
                .setLabel('Fechar')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Próximo')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(queue.length <= pageSize)

        );

    await interaction.reply({ embeds: [queueEmbed], components: [row] });

    const filter = i => ['previous', 'next', 'close'].includes(i.customId);
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        if (i.customId === 'close') {
            await i.message.delete();
            collector.stop();
            return;
        }

        if (i.customId === 'previous') {
            currentPage--;
        } else if (i.customId === 'next') {
            currentPage++;
        }

        const newEmbed = generateQueueEmbed(currentPage);

        const newRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Anterior')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Próximo')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled((currentPage + 1) * pageSize >= queue.length),
                new ButtonBuilder()
                    .setCustomId('close')
                    .setLabel('Fechar')
                    .setStyle(ButtonStyle.Danger)
            );

        await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', collected => {
        // Optionally handle what happens when the collector ends (e.g., disable buttons)
    });
}

module.exports = { data, execute };
