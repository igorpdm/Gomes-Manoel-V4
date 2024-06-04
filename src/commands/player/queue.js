const {getVoiceConnection} = require('@discordjs/voice');
const queue = require('../../shared/queue');
const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const {currentMusic} = require("./play")

const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Exibe a fila de músicas');

async function execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        const embed = new EmbedBuilder()
            .setTitle("Erro")
            .setDescription("Não estou conectado a nenhum canal de voz.")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setThumbnail(interaction.guild.iconURL())
            .setColor(0xFF0000);
        return interaction.reply({embeds: [embed]});
    } else if (queue.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle("Fila de Músicas")
            .setDescription("Não há músicas na fila.")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setThumbnail(interaction.guild.iconURL())
            .setColor(0x0099FF);
        return interaction.reply({embeds: [embed]});
    }

    const botAvatarURL = interaction.client.user.displayAvatarURL();
    let currentPage = 0;
    let pageSize = 10;

    const totalDuration = queue.reduce((acc, music) => acc + music.duracao, 0);
    const formattedDuration = new Date(totalDuration * 1000).toISOString().substr(11, 8);

    // Função para criar a barra de progresso
    const createProgressBar = (currentTime, duration) => {
        const progress = Math.floor((currentTime / duration) * 10);
        let bar = '▬'.repeat(10).split('');
        if (progress >= 0 && progress < bar.length) {
            bar[progress] = '🔘';
        }
        return bar.join('');
    };

    // Função para gerar a embed da fila de músicas
    const generateQueueEmbed = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const currentQueue = queue.slice(start, end);

        const currentTime = getCurrentTime(currentMusic); // Tempo atual da música em segundos (você precisa obter isso do seu player)
        const progressBar = createProgressBar(currentTime, currentMusic.musica.duracao);

        const embed = new EmbedBuilder()
            .setDescription(`🎶 **Tocando agora:** \n**[${currentMusic.musica.nome}](${currentMusic.musica.url})\n\`${new Date(currentTime * 1000).toISOString().substr(14, 5)} / ${new Date(currentMusic.musica.duracao * 1000).toISOString().substr(14, 5)}\` ${progressBar}**\n\n` +
                "**🎶 Músicas na fila:**\n" + currentQueue.map((music, index) => `**${start + index + 1}.** **\`${formatDuration(music.duracao)}\`** [**${music.nome}**](${music.url})`).join('\n'))
            .setFooter({text: `Página ${page + 1} de ${Math.ceil(queue.length / pageSize)} (${queue.length} músicas) | Tempo estimado: ${formattedDuration}`})
            .setThumbnail(botAvatarURL)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
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

    await interaction.reply({embeds: [queueEmbed], components: [row]});

    const filter = i => ['previous', 'next', 'close'].includes(i.customId);
    const collector = interaction.channel.createMessageComponentCollector({filter, time: 60000});

    collector.on('collect', async i => {
        try {
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
                        .setCustomId('close')
                        .setLabel('Fechar')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Próximo')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((currentPage + 1) * pageSize >= queue.length)
                );

            await i.update({embeds: [newEmbed], components: [newRow]});
        } catch (error) {
            console.log("[QUEUE] Erro ao processar a interação:");
        }
    });

    collector.on('end', async collected => {
        try {
            await interaction.editReply({components: []});
        } catch (error) {
            console.log("[QUEUE] Erro ao remover os botões: ");
        }
    });
}

const getCurrentTime = (currentMusic) => {
    if (!currentMusic.startTime) return 0;
    return Math.floor((Date.now() - currentMusic.startTime) / 1000);
};

function formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {data, execute};
