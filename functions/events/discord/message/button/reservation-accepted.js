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

subStock[proto.alias].inStock -= requestedQuantity;
subStock[proto.alias].reserved += requestedQuantity;

let message = {
    channel_id: originalMessage.channel_id,
    message_id: originalMessage.id,
    content: originalMessage.content,
    embeds: originalMessage.embeds,
    components: originalMessage.components,
};

message.components[0].components[0].disabled = true;
message.components[0].components[1].disabled = true;
message.components[0].components[2].disabled = false;
message.components[0].components[3].disabled = false;

message.embeds[0].fields[message.embeds[0].fields.length - 1].value = `✅ Accepted by <@${context.params.event.member.user.id}>`;

await lib.discord.channels['@0.2.2'].messages.update(message);
await tools.updateStocks(lib, process, config, stocks);

await lib.discord.users['@0.1.6'].dms.create({
    recipient_id: requestingUserID,
    content: '',
    embeds: [
        {
            type: 'rich',
            color: constants.messageStatusColor[constants.statusSuccess],
            title: `Your prototypes request has been accepted`,
            description: `Hello *${requestingUsername}* your prototype request has been confirmed. A TM will contact you soon to organise the delivery, please stand by. 
Keep in mind you have 48hrs before the reservation expires.
Thank you for your request!`,
            fields: [
                {name: 'Prototype Requested', value: `${proto.alias} (*${proto.name}*)`},
                {name: 'Quantity Asked', value: requestedQuantity},
            ],
        }
    ]
});