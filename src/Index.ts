import { Client, Events, GatewayIntentBits, Partials, REST, Routes, Interaction, Guild, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { readdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

let history = JSON.parse(readFileSync('history.json', {encoding: 'utf-8'}));

const log = (...args: string[]) => console.log(`[LOG] ${args.join(' ')}`);
const info = (...args: string[]) => console.info(`[INFO] ${args.join(' ')}`);
const warn = (...args: string[]) => console.warn(`[WARN] ${args.join(' ')}`);
const debug = (...args: string[]) => console.debug(`[DEBUG] ${args.join(' ')}`);
const error = (...args: string[]) => {
    console.error(`[ERROR] ${args}`);
    return new Error(args.join(' '));
}
const assert = (condition: any, ...args: string[]) => {
    if (!condition)
        return console.error(`[ASSERT] ${args.join(' ')}`);
}

dotenv.config();
const env = {
    TOKEN: process.env.TOKEN,
    CLIENT_ID: process.env.CLIENT_ID
};
assert(env.TOKEN, 'TOKEN is not defined');
assert(env.CLIENT_ID, 'CLIENT_ID is not defined');

type command = {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction, properties: {[key: string]: any}) => void | any
};

const commands: command[] = [];
const commandRef: {[key: string]: command} = {};
info('Importing commands...');
readdirSync(join(__dirname, 'commands')).forEach((module: string) => {
    debug(`Importing command ${module}`);
    const command = require(join(__dirname, 'commands', module));
    if (!command.data)
        return error(`Command ${module} does not have a data field, defaulting to empty.`);
    if (!command.data.name) {
        warn(`Command ${module} does not have a name, defaulting to filename.`);
        command.data = command.data.setName(module.split('.')[0]);
    }
    commandRef[command.data.name] = command;
    commands.push(command.data.toJSON());
});

const client = new Client({
    intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
    partials: Object.values(Partials) as Partials[],
});

client.once(Events.ClientReady, () => {
    const rest = new REST({ version: '10' }).setToken(env.TOKEN?? '');
    info('Refreshing application (/) commands.');
    rest.put(Routes.applicationCommands(env.CLIENT_ID?? ''), { body: commands })
        .then(() => {
            info('Successfully reloaded application (/) commands.');
        })
        .catch((err) => {
            error('Failed to refresh application (/) commands:', err);
        });
    info('Successfully refreshed application (/) commands.');
    info(`${client.user?.tag} is ready!`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandRef[interaction.commandName];
    if (command) {
        log(`@${interaction.user.tag} ran /${interaction.commandName}`);
        if (command.execute)
            try {
                await command.execute(interaction, interaction.commandName === 'chat'? {history: history, updateCallback: newHistory => {
                    history = newHistory;
                    writeFileSync('history.json', JSON.stringify(history, undefined, 4));
                }} : {client: client});
            } catch (err) {
                error(`Command ${interaction.commandName} failed:`, err);
                await interaction.reply({content: `:x: Command failed: ${err}`});
            }
        else
            await interaction.reply({content: `:x: ${interaction.commandName??''} is missing field \`execute\``});
    } else await interaction.reply({content: `:x: ${interaction.commandName??''} is missing field \`this\``});
});

client.login(env.TOKEN);