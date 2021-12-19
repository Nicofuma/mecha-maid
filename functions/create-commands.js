const constants = require('../utils/constants');

module.exports = async (guild_id = '', context) => {
    const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

    let commands = [
        {
            "name": "config",
            "description": "Set the current channel as used by Mecha Maid",
            "options": [
                {
                    "type": 1,
                    "name": "reservation",
                    "description": "Set the current channel for tech reservation using Mecha Maid.",
                    "options": [
                        {
                            "type": 5,
                            "name": "force",
                            "description": "Force the use of this channel even if another one is already configured",
                            "required": false
                        }
                    ]
                },
                {
                    "type": 1,
                    "name": "rules",
                    "description": "Set the current channel for Mecha Maid help and tech rules.",
                },
            ]
        }
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