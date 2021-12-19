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

message.embeds[0].fields[message.embeds[0].fields.length - 1].value = `❌ Denied by <@${context.params.event.member.user.id}>`;

await lib.discord.channels['@0.2.2'].messages.update(message);

await lib.discord.users['@0.1.6'].dms.create({
    recipient_id: requestingUserID,
    content: '',
    embeds: [
        {
            type: 'rich',
            color: constants.messageStatusColor[constants.statusFailed],
            title: `Your prototypes request has been denied`,
            description: `Hello *${requestingUsername}* your prototype request has been denied. Make sure your request was following the rules, and that the amount of kits requested are available for reservation!
Please contact a TM if you are still having issues.`,
            fields: [
                {name: 'Prototype Requested', value: `${proto.alias} (*${proto.name}*)`},
                {name: 'Quantity Asked', value: requestedQuantity},
            ],
        }
    ]
});