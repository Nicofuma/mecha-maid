const constants = require('../../../../../utils/constants');
const checks = require("../../../../../utils/checks");
const tools = require("../../../../../utils/tools");

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let config = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.tmConfigKey,
});

const originalMessage = context.params.event.message;

const requestedPrototype = tools.getRequestedPrototype(originalMessage);
const requestedQuantity = tools.getRequestedQuantity(originalMessage);
const requestingUserID = tools.getRequestingUserID(originalMessage);
const requestingUsername = tools.getRequestingUsername(originalMessage);

let [stocks, subStock, proto] = await tools.findSubStock(lib, process, context, requestedPrototype);
if (stocks === null) {
    return;
}

let message = {
    channel_id: originalMessage.channel_id,
    message_id: originalMessage.id,
    content: originalMessage.content,
    embeds: originalMessage.embeds,
};

message.embeds[0].fields[message.embeds[0].fields.length - 1].value += `・✖️ cancelled by <@${context.params.event.member.user.id}>`;

await lib.discord.channels['@0.2.2'].messages.update(message);

try {
    subStock[proto.alias].inStock += requestedQuantity;
    subStock[proto.alias].reserved -= requestedQuantity;

    await tools.updateStocks(lib, process, config, stocks);
} catch (e) {}

await lib.discord.users['@0.1.6'].dms.create({
    recipient_id: requestingUserID,
    content: '',
    embeds: [
        {
            type: 'rich',
            color: constants.messageStatusColor[constants.statusFailed],
            title: `Your prototypes request has been cancelled`,
            description: `Hello *${requestingUsername}* your prototype request has been cancelled. Your request might have expired if it's been more than 48hrs since the confirmation.
Please contact a TM for more information.`,
            fields: [
                {name: 'Prototype Requested', value: `${proto.alias} (*${proto.name}*)`},
                {name: 'Quantity Asked', value: requestedQuantity},
            ],
        }
    ]
});