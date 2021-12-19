const lodash = require('lodash');
const constants = require("./constants");
const checks = require("./checks");

function generateStockMessage(stocks) {
    let message = {
        content: '',
        embeds: [],
    }

    if (stocks === null || stocks === undefined) {
        stocks = {
            weapons: {},
            vehicles: {},
        }
    }

    const weaponsFields = [];
    new Map(Object.entries(stocks.weapons)).forEach((stock, proto) => {
        weaponsFields.push([
            {value: `${proto} *(${constants.weaponsMap.get(proto.toLowerCase()).name})*`, name: '\u200b'},
            {name: 'Available', value: stock.inStock, inline: true},
            {name: 'Reserved', value: stock.reserved, inline: true},
        ]);
    })

    const vehiclesFields = [];
    new Map(Object.entries(stocks.vehicles)).forEach((stock, proto) => {
        vehiclesFields.push([
            {value: `${proto} *(${constants.vehiclesMap.get(proto.toLowerCase()).name})*`, name: '\u200b'},
            {name: 'Available', value: stock.inStock, inline: true},
            {name: 'Reserved', value: stock.reserved, inline: true},
        ]);
    })

    function addEmbeds(color, title, emptyText, fields) {
        let embed = {
            type: 'rich',
            color: color,
            title: title,
            fields: [],
        };
        let i = 0;
        let empty = true;
        for (const f of fields) {
            if ((i + f.length) > 25) {
                message.embeds.push(embed);
                i = 0;
                embed = {
                    type: 'rich',
                    color: color,
                    fields: [],
                };
            }
            embed.fields.push(...f)
            i += f.length;
            empty = false;
        }
        if (empty) {
            embed.fields.push({name: emptyText, value: '\u200b'})
        }
        message.embeds.push(embed);
    }

    addEmbeds(constants.weaponColor, ':gun: Available *Weapon* prototypes', 'No *Weapon* prototype available', weaponsFields);
    addEmbeds(constants.vehicleColor, ':gun: Available *Vehicle* prototypes', 'No *Vehicle* prototype available', vehiclesFields);

    return message;
}

function adaptStockMsgForGuild(guildData, stockMessage) {
    if (!guildData.hasOwnProperty('reservationChannel')) {
        return
    }
    stockMessage.channel_id = guildData.reservationChannel.channelID;
    stockMessage.message_id = guildData.reservationChannel.messageID;

    stockMessage.embeds.unshift({
        type: 'rich',
        color: constants.generalColor,
        title: 'Protokits are now available for reservation !',
        description: `For any request, please use the appropriate command.

After confirmation of the request by the TMs, you will be contacted back for delivery.
Keep in mind you will have 48 hours to retrieve your prototype kit. If you were unable to retrieve your kit within that time, your request will be canceled and the kit will be made available to the public.`,
        fields: [],
    });

    if (guildData.hasOwnProperty('rulesChannel')) {
        stockMessage.embeds[0].fields.push({
            name: '\u200b',
            value: `*Please Make sure your reservations are following the rules in <#${guildData.rulesChannel.channelID}>.*`
        });
    }
    return stockMessage;
}

async function updateStocksOnAllGuilds(lib, process, message) {
    const clients = await lib.utils.kv['@0.1.16'].get({
        'key': process.env.ENV + '_' + constants.clientsChannelsKey,
    });

    for (const guild of Object.entries(clients)) {
        await lib.discord.channels['@0.2.2'].messages.update(
            adaptStockMsgForGuild(guild[1], lodash.cloneDeep(message))
        );
    }
}

async function getStocks(lib, process) {
    let stocks = await lib.utils.kv['@0.1.16'].get({
        'key': process.env.ENV + '_' + constants.tmStocksKey,
    });

    if (stocks === null || stocks === undefined) {
        stocks = {
            weapons: {},
            vehicles: {},
        }
    }
    return stocks;
}

async function findSubStock(lib, process, context, prototype) {
    let stocks = await getStocks(lib, process);

    prototype = prototype.toLowerCase();
    let stock;
    if (constants.weaponsMap.has(prototype)) {
        stock = stocks.weapons;
        prototype = constants.weaponsMap.get(prototype);
    } else if (constants.vehiclesMap.has(prototype)) {
        stock = stocks.vehicles;
        prototype = constants.vehiclesMap.get(prototype);
    } else {
        await checks.sendError(lib, context, `The *${prototype}* prototype is unknown, please refer to the list in the help channel.`)
        return [null, null, null];
    }
    return [stocks, stock, prototype];
}

async function updateStocks(lib, process, config, stocks) {
    if (stocks === null) {
        await lib.utils.kv['@0.1.16'].clear({
            'key': process.env.ENV + '_' + constants.tmStocksKey,
        });
    } else {
        await lib.utils.kv['@0.1.16'].set({
            'key': process.env.ENV + '_' + constants.tmStocksKey,
            'value': stocks,
        });
    }

    let stockMessage = generateStockMessage(stocks)
    stockMessage.channel_id = config.channels[constants.tmStock].channelID;
    stockMessage.message_id = config.channels[constants.tmStock].messageIDs[0]
    await lib.discord.channels['@0.2.2'].messages.update(stockMessage);

    await updateStocksOnAllGuilds(lib, process, stockMessage);
}

async function updateReserveCommand(lib, config, stocks) {
    function toDiscordOptions(stock, map) {
        let options = [];

        for (const entry of Object.keys(stock)) {
            options.push({
                name: map.get(entry.toLowerCase()).alias + " (" + map.get(entry.toLowerCase()).name + ")",
                value: map.get(entry.toLowerCase()).alias,
            });
        }
        return options;
    }

    let weaponsOptions = toDiscordOptions(stocks.weapons, constants.weaponsMap);
    let vehiclesOptions = toDiscordOptions(stocks.vehicles, constants.vehiclesMap);

    if (weaponsOptions.length === 0) {
        weaponsOptions.push({
            name: 'No weapon prototype available',
            value: 'n/a',
        });
    }
    if (vehiclesOptions.length === 0) {
        vehiclesOptions.push({
            name: 'No vehicle prototype available',
            value: 'n/a',
        });
    }

    const command = {
        "name": "reserve",
        "description": "Reserve prototypes",
        "options": [
            {
                "type": 1,
                "name": "weapon",
                "description": "Reserve weapon prototypes",
                "options": [
                    {
                        "type": 3,
                        "name": "prototype",
                        "description": "Prototype to reserve",
                        "choices": weaponsOptions,
                        "required": true
                    },
                    {
                        "type": 4,
                        "name": "quantity",
                        "description": "Number of prototypes wanted",
                        "min_value": 0,
                        "required": true
                    }
                ]
            },
            {
                "type": 1,
                "name": "vehicle",
                "description": "Reserve vehicle prototypes",
                "options": [
                    {
                        "type": 3,
                        "name": "prototype",
                        "description": "Prototype to reserve",
                        "choices": vehiclesOptions,
                        "required": true
                    },
                    {
                        "type": 4,
                        "name": "quantity",
                        "description": "Number of prototypes wanted",
                        "min_value": 0,
                        "required": true
                    }
                ]
            }
        ]
    };
    await lib.discord.commands['@0.0.0'].create(command);
}

function getRequestedPrototype(message) {
    return message.embeds[0].fields[1].value.replace(/^([^()]+) \(.*/, '$1')
}

function getRequestedQuantity(message) {
    return parseInt(message.embeds[0].fields[2].value);
}

function getRequestingUserID(message) {
    return message.embeds[0].description.replace(/[^(]+ \(*([0-9]+)\) [^)]+$/, '$1')
}

function getRequestingUsername(message) {
    return message.embeds[0].description.replace(/^\*([^()]+)\* \(.*/, '$1')
}

module.exports = {
    getStocks: getStocks,
    findSubStock: findSubStock,
    updateStocks: updateStocks,
    adaptStockMsgForGuild: adaptStockMsgForGuild,
    generateStockMessage: generateStockMessage,
    updateStocksOnAllGuilds: updateStocksOnAllGuilds,
    updateReserveCommand: updateReserveCommand,
    getRequestedPrototype: getRequestedPrototype,
    getRequestedQuantity: getRequestedQuantity,
    getRequestingUserID: getRequestingUserID,
    getRequestingUsername: getRequestingUsername,
}