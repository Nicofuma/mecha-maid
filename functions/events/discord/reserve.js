const constants = require('../../../utils/constants');
const checks = require("../../../utils/checks");
const tools = require("../../../utils/tools");

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

const guildID = context.params.event.guild_id;

let clients = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.clientsChannelsKey,
});

if (!clients.hasOwnProperty(guildID)) {
    return await checks.sendError(lib, context, 'Your server is not configured to be used with Mecha Maid, please see with your administrator.');
}

const client = clients[guildID];
if (!await checks.ensureSameChannel(lib, context, client.reservationChannel.channelID)) {
    return
}

const prototype = context.params.event.data.options[0].options[0].value;
if (prototype === 'n/a') {
    return
}

const quantity = context.params.event.data.options[0].options[1].value;

let [stocks, subStock, proto] = await tools.findSubStock(lib, process, context, prototype);
if (subStock === null) {
    return await checks.sendError(lib, context, `The prototype ${prototype} does not exists.`);
}

if (!subStock.hasOwnProperty(proto.alias)) {
    return await checks.sendError(lib, context, `The prototype ${proto.alias} is not open for reservation.`);
}

let config = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.tmConfigKey,
});

const userID = context.params.event.member.user.id;
const userName = context.params.event.member.user.username
const avatar = context.params.event.member.user.avatar

const message = {
    channel_id: config.channels[constants.tmReservation].channelID,
    message_id: config.channels[constants.tmReservation].messageIDs[0],
    content: '',
    embeds: [
        {
            type: 'rich',
            color: constants.generalColor,
            title: `${userName} wants to reserve ${quantity} ${proto.alias}`,
            author: {name: userName, icon_url: `https://cdn.discordapp.com/avatars/${userID}/${avatar}.png`},
            thumbnail: {url: `https://cdn.discordapp.com/avatars/${userID}/${avatar}.png`},
            description: `*${userName}* (${userID}) wants to reserve some prototypes`,
            footer: {text: `Warning: *In stock* and *Reserved* data on this message may be outdated.`},
            fields: [
                {name: 'Origin Discord', value: client.guildName},
                {name: 'Prototype Requested', value: `${proto.alias} (*${proto.name}*)`},
                {name: 'Asked', value: quantity, inline: true},
                {name: 'In stock', value: subStock[proto.alias].inStock, inline: true},
                {name: 'Reserved', value: subStock[proto.alias].reserved, inline: true},
                {name: 'Status', value: '🟡 Waiting'},
            ],
        }
    ],
    components: [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Accept',
                    style: 3,
                    emoji: {name: '✅'},
                    custom_id: 'reservation-accepted'
                },
                {
                    type: 2,
                    label: 'Deny',
                    style: 4,
                    emoji: {name: '❌'},
                    custom_id: 'reservation-denied'
                },
                {
                    type: 2,
                    label: 'Delivered',
                    style: 3,
                    emoji: {name: '✔'},
                    custom_id: 'reservation-delivered',
                    disabled: true
                },
                {
                    type: 2,
                    label: 'Cancelled',
                    style: 2,
                    emoji: {name: '✖️'},
                    custom_id: 'reservation-cancelled',
                    disabled: true
                }
            ]
        }
    ],
};
await lib.discord.channels['@0.2.2'].messages.create(message);
await checks.sendFeedback(lib, context, constants.statusSuccess, 'Your request has been transmitted to the Tech Maids');