const constants = require('../../../utils/constants');
const checks = require("../../../utils/checks");
const tools = require("../../../utils/tools");

const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

if (!await checks.ensureAdministrator(lib, context)) {return}

const options = context.params.event.data.options;
const guildID = context.params.event.guild_id;
const channelID = context.params.event.channel_id;

let forceCreate = false;
if (options.length > 0) {
    forceCreate = options[0].value;
}

let clients = await lib.utils.kv['@0.1.16'].get({
    'key': process.env.ENV + '_' + constants.clientsChannelsKey,
});

if (clients === undefined || clients === null) {
    clients = {};
}

let client = {};
if (clients.hasOwnProperty(guildID)) {
    client = clients[guildID];
}
client.guildID = guildID;

let guild = await lib.discord.guilds['@0.1.3'].retrieve({
    guild_id: client.guildID,
});

client.guildName = guild.name;
client.guildIcon = guild.icon;
client.guildIconURL = guild.icon_url;
client.guildOwner = guild.owner;
client.guildOwnerID = guild.owner_id;

let userMessage = {
    status: constants.statusSuccess,
    message: 'channel configured for Mecha Maid.'
};

switch (context.params.event.data.options[0].name) {
    case 'reservation':
        if (client.hasOwnProperty('reservationChannel')) {
            const client = clients[guildID];
            if (client.channelID !== channelID) {
                if (!forceCreate) {
                    userMessage = {
                        status: constants.statusFailed,
                        message: `the channel <#${client.channelID}> is already configured for Mecha Maid. If you wish to change it, set the *force* option to true.`,
                    }
                    break;
                } else {
                    try {
                        await lib.discord.channels['@0.2.2'].messages.destroy({
                            channel_id: client.reservationChannel.channelID,
                            message_id: client.reservationChannel.messageID,
                        });

                        userMessage = {
                            status: constants.statusSuccess,
                            message: `Mecha Maid channel replaced, the previous message has been deleted.`,
                        }
                    } catch (_) {
                        userMessage = {
                            status: constants.statusSuccess,
                            message: `Mecha Maid channel replaced.`,
                        }
                    }
                    // continue to overwrite the discord config
                }
            } else {
                try {
                    await lib.discord.channels['@0.2.2'].messages.destroy({
                        channel_id: client.reservationChannel.channelID,
                        message_id: client.reservationChannel.messageID,
                    });

                    userMessage = {
                        status: constants.statusSuccess,
                        message: `channel already configured for Mecha Maid. Its message has been re-created.`,
                    }
                } catch (e) {
                    // Mecha Maid message not found, creating it
                    userMessage = {
                        status: constants.statusSuccess,
                        message: `channel already configured for Mecha Maid. Its message being missing it has been created.`,
                    }
                }
                // continue to overwrite the discord config
            }
        }

        client.reservationChannel = {
            messageID: 0,
            channelID: channelID,
        };

        const message = await lib.discord.channels['@0.2.2'].messages.create(
            tools.adaptStockMsgForGuild(
                client,
                tools.generateStockMessage(
                    await tools.getStocks(lib, process)
                )
            )
        );

        client.reservationChannel.messageID = message.id;
        break;
    case 'rules':
        // TODO: automatically post rules?

        client.rulesChannel = {
            channelID: channelID,
        };
        break;
}

if (userMessage.status === constants.statusSuccess) {
    clients[guildID] = client;

    await lib.utils.kv['@0.1.16'].set({
        key: process.env.ENV + '_' + constants.clientsChannelsKey,
        value: clients,
    });
}

await checks.sendFeedback(lib, context, userMessage.status, userMessage.message);