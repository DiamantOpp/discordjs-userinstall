import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

const log = (...args: string[]) => console.log(`[LOG] ${args.join(' ')}`);
const info = (...args: string[]) => console.info(`[INFO] ${args.join(' ')}`);
const assert = (condition: any, ...args: string[]) => { if (!condition) console.error(`[ASSERT] ${args.join(' ')}`);}
type messagesType = {role: 'system'|'user'|'assistant', content: string}[];
type historyType  = {[key: string]: messagesType};

module.exports = {
    data: new SlashCommandBuilder()
          .setName('chat')
          .setDescription('Chat with le idiote') // do change this for your own forks, lol
          .setIntegrationTypes(1)
          .setContexts(0, 1, 2)
          .addStringOption(option =>
                option.setName('prompt')
                      .setDescription('Your message')
                      .setRequired(true)
          ),
    execute: async (interaction: ChatInputCommandInteraction, properties: {history: historyType, updateCallback: (history: historyType) => void}) => {
        const history = properties.history;
        const index = interaction.channelId;
        assert(process.env.INIT_AI, 'INIT_AI is undefined in .env, the AI will very likely NOT work as expected!');
        history[index] = history[index]?? [
            {
                role: 'system', content: process.env.INIT_AI
               ?.replaceAll('\\n', '\n')
                .replaceAll('$who', `@${interaction.user.username}`)
                .replaceAll(
                    '$time',
                    new Date()
                    .toLocaleString('sv-SE')
                    .replace(' ', 'T')
                    +'.000Z')
                ?? ''
            }
        ]
        if (history[index].length > 45)
            history[index] = [history[index][0], ...history[index].slice(-44)];
        const prompt = interaction.options.getString('prompt');
        if (!prompt)
            return interaction.reply(':x: No prompt provided');
        info(`Identifier: ${index}`);
        log(`@${interaction.user.username}: ${prompt}`);
        history[index].push({role: 'user', content: `${interaction.user.username}: ${prompt}`});
        await interaction.deferReply();
        const reply = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_KEY}`
            },
            body: JSON.stringify({
                messages: history[index],
                model: 'llama3-70b-8192',
                temperature: 1
            }),
        }).then(async (res: Response) => {
            if (!res.ok)
                return interaction.editReply(`:x: ${res.status} ${res.statusText}`);
            return res.json().then(data => data.choices[0].message.content)
        });
        log(`AI to @${interaction.user.username}: ${reply}`);
        history[index].push({role: 'assistant', content: reply});
        properties.updateCallback(history);
        let say = `> ${prompt}\n${reply}`;
        say = say.length >= 2000? `${say.slice(0, 1997)}...` : say;
        await interaction.editReply(say);
    }
}