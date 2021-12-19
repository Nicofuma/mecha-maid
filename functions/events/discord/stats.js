const constants = require('../../../utils/constants');
const checks = require('../../../utils/checks');
const tools = require('../../../utils/tools');

async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {resolve()}, ms || 0);
    });
}

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let config = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.tmConfigKey,
});

reservationChannelID = config.channels[constants.tmReservation].channelID;

let lastMessage = '';
let stats = {
    protos: {},
    requests: {
        not_handled: 0,
        validated: 0,
        delivered: 0,
        denied: 0,
        cancelled: 0,
    }
};

let messages;
do {
    let params = {
        channel_id: reservationChannelID,
        limit: 100,
    };
    if (lastMessage !== '') {
        params.before = lastMessage;
    }
    messages = await lib.discord.channels['@0.2.2'].messages.list(params);
    for (const message of messages) {
        lastMessage = message.id;
        if (message.content !== '') {
            continue
        } else if (message.embeds.length === 0) {
            continue
        } else if (!message.embeds[0].title.includes(' wants to reserve ')) {
            continue
        }

        let requestStatus = 'not_handled';
        const statusLine = message.embeds[0].fields[message.embeds[0].fields.length - 1].value;
        if (statusLine.includes('🟡')) {
            requestStatus = 'not_handled';
        } else if (statusLine.includes('✔')) {
            requestStatus = 'delivered';
        } else if (statusLine.includes('✖️')) {
            requestStatus = 'cancelled';
        } else if (statusLine.includes('✅')) {
            requestStatus = 'validated';
        } else if (statusLine.includes('❌')) {
            requestStatus = 'denied';
        }

        const requestedPrototype = tools.getRequestedPrototype(message);
        const requestedQuantity = tools.getRequestedQuantity(message);

        if (!stats.protos.hasOwnProperty(requestedPrototype)) {
            stats.protos[requestedPrototype] = {
                generated: 0,
                requested: 0,
                accepted: 0,
                delivered: 0,
            }
        }

        stats.protos[requestedPrototype].requested += requestedQuantity;
        if (requestStatus === 'delivered') {
            stats.protos[requestedPrototype].delivered += requestedQuantity;
        }

        if (requestStatus !== 'denied') {
            stats.protos[requestedPrototype].accepted += requestedQuantity;
        }
        stats.requests[requestStatus] += 1;
    }

    if (messages.length === 100) {
        await sleep(1500);
    }
} while(messages.length === 100);

protoCol = [];
requestedCol = [];
deliveredCol = [];

for (let proto of Object.keys(stats.protos)) {
    protoCol.push(proto);
    requestedCol.push(stats.protos[proto].requested.toString() + ' *('+ stats.protos[proto].accepted.toString() +' accepted)*');
    deliveredCol.push(stats.protos[proto].delivered.toString());
}

satusCol = [];
countCol = [];

for (let status of Object.keys(stats.requests)) {
    satusCol.push(status);
    countCol.push(stats.requests[status].toString());
}

let channelID = context.params.event.channel_id;
if (context.params.event.data.options.length > 0 && context.params.event.data.options[0].value) {
    channelID = context.params.event.data.options[0].value;
}

const message = {
    channel_id: channelID,
    content: '',
    embeds: [
        {
            type: 'rich',
            color: constants.generalColor,
            title: `Mecha Maid statistics`,
            thumbnail: {url: `https://image.flaticon.com/icons/png/512/432/432548.png`},
            description: `Here are the statistics computed from all the messages in the reservation channel.`,
            footer: {text: `This command is very expensive, do not spam it please.`},
            fields: [
                {name: 'Prototypes', value: 'Stats about the prototypes themselves.'},
                {name: 'Prototype', value: protoCol.join('\n'), inline: true},
                {name: 'Requested', value: requestedCol.join('\n'), inline: true},
                {name: 'Delivered', value: deliveredCol.join('\n'), inline: true},
                {name: 'Requests', value: 'Stats about the requests made by the wardens.'},
                {name: 'Status', value: satusCol.join('\n'), inline: true},
                {name: 'Count', value: countCol.join('\n'), inline: true},
            ],
        }
    ]
}

await lib.discord.channels['@0.2.2'].messages.create(message);