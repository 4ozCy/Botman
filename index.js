const { Client, GatewayIntentBits, ButtonBuilder, ActionRowBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
  partials: ['MESSAGE', 'CHANNEL']
});

const REAL_LIFE = '1284548623073280072';
const HENTAI = '1284548623073280071';

let isRequestingRealLife = false;
let isRequestingHentai = false;

async function startRequests(channel, type) {
    if (type === 'realLife') {
        isRequestingRealLife = true;
    } else if (type === 'hentai') {
        isRequestingHentai = true;
    }

    channel.send('Started making requests.');

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
                gifUrl = post.file_url.endsWith('.gif') ? post.file_url : null;
            } else {
                gifUrl = response.data.message || response.data.link;
            }
            const embed = new EmbedBuilder()
                .setTitle(type === 'realLife' ? 'Real life' : 'Hentai')
                .setImage(gifUrl);

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error making request:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 900));
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

client.on('messageCreate', async message => {
    const channel = message.channel;

    if (channel.id === REAL_LIFE || channel.id === HENTAI) {
        if (message.content.toLowerCase().includes('start')) {
            if (channel.id === REAL_LIFE && !isRequestingRealLife) {
                startRequests(channel, 'realLife');
            } else if (channel.id === HENTAI && !isRequestingHentai) {
                startRequests(channel, 'hentai');
            } else {
                channel.send(`Requests are already running for ${channel.id === REAL_LIFE ? 'Real Life' : 'Hentai'}.`);
            }
        } else if (message.content.toLowerCase().includes('stop')) {
            if (channel.id === REAL_LIFE && isRequestingRealLife) {
                stopRequests('realLife', channel);
            } else if (channel.id === HENTAI && isRequestingHentai) {
                stopRequests('hentai', channel);
            } else {
                channel.send(`Requests are not running for ${channel.id === REAL_LIFE ? 'Real Life' : 'Hentai'}.`);
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
