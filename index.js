const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, EmbedBuilder, InteractionType } = require('discord.js');
const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
  partials: ['MESSAGE', 'CHANNEL']
});

let isRequestingRealLife = false;
let isRequestingHentai = false;

async function startRequests(channel, type) {
    if (type === 'realLife') {
        isRequestingRealLife = true;
    } else if (type === 'hentai') {
        isRequestingHentai = true;
    }

    await channel.send('Started making requests.');

    while ((type === 'realLife' ? isRequestingRealLife : isRequestingHentai)) {
        try {
            const apiUrls = type === 'realLife'
                ? [
                    'https://nekobot.xyz/api/image?type=pussy',
                    'https://nekobot.xyz/api/image?type=boobs',
                    'https://nekobot.xyz/api/image?type=ass',
                    'https://nekobot.xyz/api/image?type=anal'
                  ]
                : [
                    'https://purrbot.site/api/img/nsfw/fuck/gif',
                    'https://purrbot.site/api/img/nsfw/anal/gif',
                    'https://purrbot.site/api/img/nsfw/pussylick/gif',
                    'https://purrbot.site/api/img/nsfw/yuri/gif',
                    'https://nekobot.xyz/api/image?type=hass',
                    'https://nekobot.xyz/api/image?type=hyuri',
                    'https://nekobot.xyz/api/image?type=hentai',
                    'https://nekobot.xyz/api/image?type=hboobs',
                    'https://nekobot.xyz/api/image?type=hentai_anal',
                    'https://api.waifu.pics/nsfw/waifu',
                    'https://purrbot.site/api/img/nsfw/threesome_mmf/gif',
                    'https://purrbot.site/api/img/nsfw/threesome_ffm/gif',
                    'https://purrbot.site/api/img/nsfw/threesome_fff/gif',
                    'https://purrbot.site/api/img/nsfw/cum/gif/',
                    'https://nekobot.xyz/api/image?type=hmidriff',
                    'https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=hentai+animated&limit=1'
                  ];

            const randomApiUrl = apiUrls[Math.floor(Math.random() * apiUrls.length)];
            const response = await axios.get(randomApiUrl);
            let gifUrl;
            if (randomApiUrl.includes('gelbooru.com')) {
                const post = response.data.post[0];
                if (post.file_url.endsWith('.gif')) {
                    gifUrl = post.file_url;
                } else {
                    gifUrl = null;
                }
            } else {
                gifUrl = response.data.message || response.data.link;
            }
            const embed = new EmbedBuilder()
                .setTitle(type === 'realLife' ? 'Real Life' : 'Hentai')
                .setImage(gifUrl);

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error making request:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

function stopRequests(type, channel) {
    if (type === 'realLife') {
        isRequestingRealLife = false;
    } else if (type === 'hentai') {
        isRequestingHentai = false;
    }

    channel.send('Stopped making requests.');
}

client.on('messageCreate', async (message) => {
    if (message.author.dmChannel) {
        const command = message.content.trim().toLowerCase();
        if (command === 'start requests') {
            const embed = new EmbedBuilder().setTitle('Choose an Option').setDescription('Click a button to start Real Life or Hentai requests.');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('realLife').setLabel('Real Life').setStyle('Primary'),
                new ButtonBuilder().setCustomId('hentai').setLabel('Hentai').setStyle('Secondary')
            );
            await message.author.dmChannel.send({ embeds: [embed], components: [row] });
        } else if (command === 'stop requests') {
            if (isRequestingRealLife) {
                stopRequests('realLife', message.author.dmChannel);
                await message.author.dmChannel.send('Stopped Real Life requests.');
            } else if (isRequestingHentai) {
                stopRequests('hentai', message.author.dmChannel);
                await message.author.dmChannel.send('Stopped Hentai requests.');
            } else {
                await message.author.dmChannel.send('No requests are currently running.');
            }
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.user.dmChannel) {
        if (interaction.customId === 'realLife') {
            if (!isRequestingRealLife) {
                startRequests(interaction.user.dmChannel, 'realLife');
                await interaction.reply({ content: 'Started Real Life requests.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Requests are already running.', ephemeral: true });
            }
        } else if (interaction.customId === 'hentai') {
            if (!isRequestingHentai) {
                startRequests(interaction.user.dmChannel, 'hentai');
                await interaction.reply({ content: 'Started Hentai requests.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Requests are already running.', ephemeral: true });
            }
        }
    }
});

app.get('/', (req, res) => {
  res.send(`botman here to serve you justice`)
})

app.listen(port, () => {
  console.log(`Port found on http://localhost:${port}`);
});

client.login(process.env.TOKEN);
