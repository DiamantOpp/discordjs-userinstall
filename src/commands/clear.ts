import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

const info = (...args: string[]) => console.info(`[INFO] ${args.join(' ')}`);
type messagesType = {role: 'system'|'user'|'assistant', content: string}[];
type historyType  = {[key: string]: messagesType};

module.exports = {
    data: new SlashCommandBuilder()
          .setName('clear')
          .setDescription('Clear le idiote\'s memory (use this for HTTP 413 errors)')
          .setIntegrationTypes(0, 1)
          .setContexts(0, 1, 2),
    execute: async (interaction: ChatInputCommandInteraction, properties: {history: historyType, updateCallback: (history: historyType) => void}) => {
        const index = interaction.channelId;
        delete properties.history[index];
        info(`Wiped index ${index} per ${interaction.user.username}'s request`);
        properties.updateCallback(properties.history);
        await interaction.reply('Cleared memory for this channel');
    }
}