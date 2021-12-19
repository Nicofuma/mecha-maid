const constants = require("./constants");

async function ensureSameChannel(lib, context, channelID) {
    if (context.params.event.channel_id !== channelID) {
        await sendError(lib, context, 'This command must be used in the channel configured for it.')
        return false;
    }
    return true;
}

async function ensureTMDiscordOnly(process, lib, context) {
    if (context.params.event.guild_id !== process.env.TECH_MAID_DISCORD_ID) {
        await sendError(lib, context, 'This command is reserved to the Tech Maid Discord.')
        return false;
    }
    return true;
}

async function ensureAdministrator(lib, context) {
    if (!context.params.event.member.permission_names.includes('ADMINISTRATOR')) {
        await sendError(lib, context, 'You must be Administrator of the server to use this command.')
        return false;
    }
    return true;
}

async function sendError(lib, context, message) {
    await sendFeedback(lib, context, constants.statusFailed, message);
}

async function sendFeedback(lib, context, status, message) {
    await lib.discord.interactions['@0.0.0'].followups.ephemeral.create({
        token: context.params.event.token,
        content: '',
        embeds: [
            {
                type: 'rich',
                color: constants.messageStatusColor[status],
                description: `${constants.messageStatusEmoji[status]} ${message}`,
            },
        ],
    });
}

module.exports = {
    ensureTMDiscordOnly: ensureTMDiscordOnly,
    ensureAdministrator: ensureAdministrator,
    ensureSameChannel: ensureSameChannel,
    sendError: sendError,
    sendFeedback: sendFeedback,
}