import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
          .setName('ping')
          .setDescription('Pong!')
          .setIntegrationTypes(0, 1)
          .setContexts(0, 1, 2),
    execute: async (interaction: ChatInputCommandInteraction, properties: {client: Client}) => {
        await interaction.reply(`Pong! ${properties.client.ws.ping}ms`);
    }
}