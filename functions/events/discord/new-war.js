const constants = require('../../../utils/constants');
const checks = require("../../../utils/checks");
const tools = require("../../../utils/tools");

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let config = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.tmConfigKey,
});

if (!await checks.ensureTMDiscordOnly(process, lib, context)) {return}
if (!await checks.ensureSameChannel(lib, context, config.channels[constants.tmStock].channelID)) {return}

await tools.updateStocks(lib, process, config, null);