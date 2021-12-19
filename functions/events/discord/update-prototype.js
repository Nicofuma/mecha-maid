const constants = require('../../../utils/constants');
const checks = require("../../../utils/checks");
const tools = require("../../../utils/tools");

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let config = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.tmConfigKey,
});

if (!await checks.ensureTMDiscordOnly(process, lib, context)) {return}
if (!await checks.ensureSameChannel(lib, context, config.channels[constants.tmStock].channelID)) {return}

const prototype = context.params.event.data.options[0].value;
const action = context.params.event.data.options[1].value;
const amount = context.params.event.data.options[2].value;

let [stocks, subStock, proto] = await tools.findSubStock(lib, process, context, prototype);
if (subStock === null) {
    return;
}

if (!subStock.hasOwnProperty(proto.alias)) {
    await checks.sendError(lib, context, `The *${proto.alias}* prototype is not in the list, please use the command */add* to make it available for reservation.`)
    return;
}

switch (action) {
    case 'add':
        subStock[proto.alias].inStock += amount;
        break;
    case 'sub':
        subStock[proto.alias].inStock -= amount;
        break;
    case 'set':
        subStock[proto.alias].inStock = amount;
        break;
}

if (subStock[proto.alias].inStock < 0) {
    await checks.sendError(lib, context, `The operation would make the stock of *${proto.alias}* negative (${amount}) which is not allowed.`)
    return;
}

await tools.updateStocks(lib, process, config, stocks);