const constants = require('../utils/constants');

module.exports = async (guild_id = '', context) => {
    const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

    let commands = [
        {
            "name": "list-clients",
            "description": "List servers visible and/or configured by the bot",
        },
        {
            "name": "stats",
            "description": "Stats (/!\\ expensive)",
            "options": [
                {
                    "type": 3,
                    "name": "channel_id",
                    "description": "ID of the channel where to post the stats (instead of the current channel)",
                    "required": false
                }
            ]
        },
    ];

    if (guild_id !== "") {
        for (let command of commands) {
            command['guild_id'] = guild_id;
        }
    }

    let resps = [];
    for (const command of commands) {
        const resp = await lib.discord.commands['@0.0.0'].create(command);
        resps.push(resp);
    }
    return {
        message: resps,
    };
};
