const constants = require('../utils/constants');

module.exports = async (guild_id = '', context) => {
    const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

    return {
        message: await lib.discord.commands['@0.0.0'].list(),
    };
};