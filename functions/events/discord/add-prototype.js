const constants = require('../../../utils/constants');
const checks = require("../../../utils/checks");
const tools = require("../../../utils/tools");

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let config = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.tmConfigKey,
});

if (!await checks.ensureTMDiscordOnly(process, lib, context)) {return}
if (!await checks.ensureSameChannel(lib, context, config.channels[constants.tmStock].channelID)) {return}

let prototype = context.params.event.data.options[0].value;
let amount = 0;
if (context.params.event.data.options.length === 2) {
    amount = context.params.event.data.options[1].value;
}

let [stocks, subStock, proto] = await tools.findSubStock(lib, process, context, prototype);
if (subStock === null) {
    return;
}

if (subStock.hasOwnProperty(proto.alias)) {
    await checks.sendError(lib, context, `The *${proto.alias}* prototype is already in the list, please use the command */update* to update the amount available and */remove* to remove it from reservation.`)
    return;
}

subStock[proto.alias] = {
    inStock: amount,
    reserved : 0,
};

await tools.updateStocks(lib, process, config, stocks);
await tools.updateReserveCommand(lib, config, stocks);