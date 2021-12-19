const constants = require('../utils/constants');

module.exports = async (guild_id = '', context) => {
    const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

    if (guild_id !== process.env.TECH_MAID_DISCORD_ID) {
        return {
            error: 'These command are reserved to the Tech Maid Discord.',
        };
    }

    let commands = [
        {
            "name": "list-clients",
            "description": "List servers visible and/or configured by the bot",
        },
        {
            "name": "stats",
            "description": "Stats (/!\\ expensive)",
        },
        /*{
            "name": "new-war",
            "description": "Resets all messages and stocks for a new war",
        },/*
        {
            "name": "config-tm",
            "description": "Configures the Mecha Maid channels for the Tech Maids",
            "options": [
                {
                    "type": 1,
                    "name": constants.tmReservation,
                    "description": "Set the current channel for tech reservation.",
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
                    "name": constants.tmStock,
                    "description": "Set the current channel for stock management.",
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
                    "name": constants.tmHelp,
                    "description": "Set the current channel for help messages.",
                    "options": [
                        {
                            "type": 5,
                            "name": "force",
                            "description": "Force the use of this channel even if another one is already configured",
                            "required": false
                        }
                    ]
                },
            ]
        },
        {
            "name": "add",
            "description": "Makes a new prototype available to reservation",
            "options": [
                {
                    "type": 3,
                    "name": "prototype",
                    "description": "Prototype to make available to reservation",
                    //"choices": constants.prototypes,
                    "required": true
                },
                {
                    "type": 4,
                    "name": "amount",
                    "description": "Number of prototypes already available",
                    "min_value": 0,
                    "required": false
                }
            ]
        },
        {
            "name": "remove",
            "description": "Remove a prototype from reservation list",
            "options": [
                {
                    "type": 3,
                    "name": "prototype",
                    "description": "Prototype to remove from reservation",
                    "choices": constants.prototypes,
                    "required": true
                }
            ]
        },
        {
            "name": "update",
            "description": "Updates the number of prototypes available to reservation",
            "options": [
                {
                    "type": 3,
                    "name": "prototype",
                    "description": "Prototype to update",
                    "choices": constants.prototypes,
                    "required": true
                },
                {
                    "type": 3,
                    "name": "action",
                    "description": "Action to perform",
                    "choices": [
                        {
                            "name": "Add prototypes",
                            "value": "add"
                        },
                        {
                            "name": "Subtract prototypes",
                            "value": "sub"
                        },
                        {
                            "name": "Set the exact number of prototypes available",
                            "value": "set"
                        }
                    ],
                    "required": true
                },
                {
                    "type": 4,
                    "name": "amount",
                    "description": "Number of prototypes",
                    "min_value": 0,
                    "required": true
                }
            ]
        },*/
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
