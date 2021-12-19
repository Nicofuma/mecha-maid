const constants = require('../../../utils/constants');
const checks = require('../../../utils/checks');
const tools = require('../../../utils/tools');

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

const channelID = context.params.event.channel_id;

if (!await checks.ensureAdministrator(lib, context)) {return}
if (!await checks.ensureTMDiscordOnly(process, lib, context)) {return}

const channelType = context.params.event.data.options[0].name;
const cmd = context.params.event.data.options[0];
let forceCreate = false;
if (cmd.hasOwnProperty('options') && cmd.options.length === 1) {
    forceCreate = cmd.options[0].value;
}

let config = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.tmConfigKey,
});

if (config === undefined ||config === null) {
    config = {
        channels: {},
    };
}

let userMessage = {
    status: constants.statusSuccess,
    message: `Mecha Maid channel configured for *${channelType}*.`
};

if (config.channels.hasOwnProperty(channelType)) {
    const channelConfig = config.channels[channelType];
    if (channelConfig.channelID !== channelID) {
        if (!forceCreate) {
            userMessage = {
                status: constants.statusFailed,
                message: `the channel <#${channelConfig.channelID}> is already configured for *${channelType}*. If you wish to change it, set the *force* option to true.`
            };
        } else {
            try {
                for (const messageID of channelConfig.messageIDs) {
                    await lib.discord.channels['@0.2.2'].messages.destroy({
                        channel_id: channelConfig.channelID,
                        message_id: messageID,
                    });
                }

                userMessage = {
                    status: constants.statusSuccess,
                    message: `Mecha Maid channel for *${channelType}* replaced, the previous message has been deleted.`
                };
            } catch (_) {
                userMessage = {
                    status: constants.statusSuccess,
                    message: `Mecha Maid channel for *${channelType}* replaced.`
                };
            }
        }
    } else {
        try {
            for (const messageID of channelConfig.messageIDs) {
                await lib.discord.channels['@0.2.2'].messages.destroy({
                    channel_id: channelConfig.channelID,
                    message_id: messageID,
                });
            }

            userMessage = {
                status: constants.statusSuccess,
                message: `Mecha Maid channel already configured for *${channelType}*. Its message has been re-created.`
            };
        } catch (_) {
            // Mecha Maid message not found, creating it
            userMessage = {
                status: constants.statusSuccess,
                message: `Mecha Maid channel already configured for  *${channelType}*. Its message being missing it has been created.`
            };
        }
        // continue to overwrite the discord config
    }
}

let messageIDs = [];
let messageObject;
switch (channelType) {
    case constants.tmHelp:
        messageObject = {
            channel_id: channelID,
            content: 'List of prototypes I am aware of. When using a command, please always use the alias.',
            embeds: [
                {
                    type: 'rich',
                    color: constants.weaponColor,
                    title: ':gun: Understood *Weapon* prototypes',
                    fields: [
                    ],
                },
                {
                    type: 'rich',
                    color: constants.vehicleColor,
                    title: ':blue_car: Understood *Vehicle* prototypes',
                    fields: [
                    ],
                }
            ],
        };

        let i = 0;
        for (const prototypes of [constants.weapons, constants.vehicles]) {
            let nameCol = [];
            let aliasCol = [];

            for (const prototype of prototypes) {
                nameCol.push(prototype.name);
                aliasCol.push(prototype.alias);
            }
            messageObject.embeds[i].fields.push(
                {
                    name: 'Name',
                    inline: true,
                    value: nameCol.join('\n'),
                }
            );
            messageObject.embeds[i].fields.push(
                {
                    name: 'Alias',
                    inline: true,
                    value: aliasCol.join('\n'),
                }
            );
            i++;
        }
        break;
    case constants.tmStock:
        messageObject = tools.generateStockMessage(null);
        messageObject.channel_id = channelID;
        break;
    case constants.tmReservation:
        messageObject = {
            channel_id: channelID,
            content: '',
            embeds: [
                {
                    type: 'rich',
                    color: constants.generalColor,
                    title: 'Reservation back channel',
                    description: `All reservation requests arrive here from the WUH or any other affiliated Discord.
Please use the reactions to accept or deny them.`,
                },
            ],
        };
        break;
}

if (messageObject !== undefined) {
    const message = await lib.discord.channels['@0.2.2'].messages.create(messageObject)
    messageIDs.push(message.id);
}

config.channels[channelType] = {
    messageIDs: messageIDs,
    channelID: channelID,
};

await lib.utils.kv['@0.1.16'].set({
    key: process.env.ENV + '_' + constants.tmConfigKey,
    value: config,
});

await checks.sendFeedback(lib, context, userMessage.status, userMessage.message);