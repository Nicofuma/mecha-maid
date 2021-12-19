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

message.embeds[0].fields[message.embeds[0].fields.length - 1].value += `・✔ delivered by <@${context.params.event.member.user.id}>`;

await lib.discord.channels['@0.2.2'].messages.update(message);

try {
    subStock[proto.alias].reserved -= requestedQuantity;

    await tools.updateStocks(lib, process, config, stocks);
} catch (e) {}