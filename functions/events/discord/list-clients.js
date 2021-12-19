const constants = require('../../../utils/constants');

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let clients = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.clientsChannelsKey,
});

let configured = {};
let known = {};
let kicked = {};

let lastGuild = '';
let resp = [];
do {
    let params = {
        limit: 100
    };
    if (lastGuild !== '') {
        params.after = lastGuild;
    }
    resp = await lib.discord.guilds['@0.1.3'].list(params);
    for (const guild of resp) {
        if (clients.hasOwnProperty(guild.id)) {
            configured[guild.id] = guild;
        } else {
            known[guild.id] = guild;
        }
    }
} while(resp.length === 100);

for (const guildID of Object.keys(clients)) {
    if (configured.hasOwnProperty(guildID)) {
        continue;
    }
    if (known.hasOwnProperty(guildID)) {
        continue;
    }
    kicked[guildID] = {
        id: guildID,
        name: 'unknown',
    }
}

let message = '__**Bot configured**__\n'
for (const guild of Object.keys(configured)) {
    message += ` - ${configured[guild].name} (*${configured[guild].id}*) in <#${clients[guild].channelID}>\n`
}

message += '\n__**Bot added but not configured**__\n'
for (const guild of Object.keys(known)) {
    message += ` - ${known[guild].name} (*${known[guild].id}*)\n`
}

message += '\n__**Bot configured but not anymore in guild**__\n'
for (const guild of Object.keys(kicked)) {
    message += ` - *${kicked[guild].id}*\n`
}

await lib.discord.interactions['@0.0.0'].followups.ephemeral.create({
    token: context.params.event.token,
    content: message,
});