function toMap(list) {
    const map = new Map();
    for (const el of list) {
        map.set(el.alias.toLowerCase(), el)
    }
    return map;
}

// --- Weapons et vehicles list ---
const weapons = [
    {
        alias: `Cascadier`,
        name: `Cascadier 873`
    },
    {
        alias: `Shotgun`,
        name: `Brasa Shotgun`
    },
    {
        alias: `Hangman`,
        name: `The Hangman 757`
    },
    {
        alias: `Fiddler`,
        name: `Fiddler Submachine Gun Model 868`
    },
    {
        alias: `Gas Grenade`,
        name: `Green Ash Grenade`
    },
    {
        alias: `Radio Backpack`,
        name: `Radio Backpack`
    },
    {
        alias: `Long Rifle`,
        name: `Clancy Cinder M3`
    },
    {
        alias: `Gas Mask`,
        name: `Gas Mask`
    },
    {
        alias: `RPG Cutler`,
        name: `Cutler Launcher 4`
    },
    {
        alias: `Bayonet`,
        name: `Buckhorn CCQ-18`
    },
    {
        alias: `Storm Rifle`,
        name: `Aalto Storm Rifle 24`
    },
    {
        alias: `Liar`,
        name: `No.1 "The Liar" Submachinegun`
    },
    {
        alias: `Blakerow`,
        name: `Blakerow 871`
    },
    {
        alias: `White Flask`,
        name: `BF5 White Ash Flask Grenade`
    },
    {
        alias: `Sampo`,
        name: `Sampo Auto-Rifle 77`
    },
    {
        alias: `Mortar`,
        name: `Cremari Mortar`
    },
    {
        alias: `Sniper Rifle`,
        name: `Clancy-Raca M4`
    },
    {
        alias: `ATR`,
        name: `20 Neville Anti-Tank Rifle`
    },
    {
        alias: `Booker`,
        name: `Booker Storm Rifle Model 838`
    },
    {
        alias: `Bonesaw`,
        name: `Bonesaw MK.3`
    },
    {
        alias: `Malone`,
        name: `Malone MK.2`
    },
    {
        alias: `Mounted Bonesaw`,
        name: `Mounted Bonesaw MK.3`
    },
    {
        alias: `Listening Kit`,
        name: `Listening Kit`
    },
    {
        alias: `Satchel`,
        name: `Alligator Charge`
    },
    {
        alias: `300mm`,
        name: `300mm Round`
    },
    {
        alias: `Revolver`,
        name: `Cometa T2-9`
    },
    {
        alias: `HMG Tripod`,
        name: `Malone Ratcatcher MK.1`
    }
];

const vehicles = [
    {
        alias: `Tracked Dune`,
        name: `Dunne Landrunner 12c`
    },
    {
        alias: `Armored Dune`,
        name: `Dunne Leatherback 2a`
    },
    {
        alias: `Motorcycle`,
        name: `Kivela Power Wheel 80-1`
    },
    {
        alias: `Resource Truck`,
        name: `Dunne Loadlugger 3c`
    },
    {
        alias: `AC`,
        name: `O'Brien v.110`
    },
    {
        alias: `FMG`,
        name: `Swallowtail 988/127-2`
    },
    {
        alias: `Bus`,
        name: `Dunne Caravaner 2f`
    },
    {
        alias: `HAC`,
        name: `O'Brien V.101 Freeman `
    },
    {
        alias: `Spitfire`,
        name: `Drummond Spitfire 100d`
    },
    {
        alias: `ALUV`,
        name: `Drummond Loscann 55c`
    },
    {
        alias: `LUV`,
        name: `Drummond 100a`
    },
    {
        alias: `Ambulance`,
        name: `Dunne Responder 3e`
    },
    {
        alias: `FM`,
        name: `Balfour Falconer 250mm`
    },
    {
        alias: `FC`,
        name: `Balfour Wolfhound 40mm`
    },
    {
        alias: `TAC`,
        name: `O'Brien v. 121 Highlander`
    },
    {
        alias: `T20`,
        name: `T20 “Ixion” Tankette`
    },
    {
        alias: `HT`,
        name: `Niska Mk. I Gun Motor Carriage`
    },
    {
        alias: `ST`,
        name: `King Spire MK. I`
    },
    {
        alias: `White Whale`,
        name: `BMS - White Whale`
    },
    {
        alias: `GB`,
        name: `74b-1 Ronan Gunship`
    },
    {
        alias: `ATHT`,
        name: `Niska Mk. II Blinder`
    },
    {
        alias: `30mm ST`,
        name: `King Gallant Mk. II`
    },
    {
        alias: `FAT`,
        name: `Collins Cannon 68mm`
    },
    {
        alias: `LT`,
        name: `Devitt Mk. III`
    },
    {
        alias: `DGB`,
        name: `74c-2 Ronan Meteora Gunship`
    },
    {
        alias: `Harvester`,
        name: `BMS - Scrap Hauler`
    },
    {
        alias: `Ironhide`,
        name: `Devitt Ironhide Mk. IV`
    },
    {
        alias: `APC`,
        name: `Mulloy LPC`
    },
    {
        alias: `Silverhand`,
        name: `Silverhand Mk. IV`
    },
    {
        alias: `Outlaw`,
        name: `Gallagher Outlaw Mk. II`
    },
    {
        alias: `Chieftan`,
        name: `Silverhand Chieftan - Mk. VI`
    },
    {
        alias: `HVFC`,
        name: `Balfour Rampart 40mm`
    },
    {
        alias: `HTD`,
        name: `Noble Widow MK. XIV`
    }
]

module.exports = {
    // --- Special K/V keys ---
    clientsChannelsKey: 'mecha_maid_channel_clients',
    tmConfigKey: 'mecha_maid_tm_config',
    tmStocksKey: 'mecha_maid_tm_stocks',

    tmReservation: 'reservation',
    tmStock: 'stock',
    tmHelp: 'help',

    // --- Emoji with special meaning ---
    statusFailed: 'failed',
    statusSuccess: 'success',

    messageStatusColor: {
        'success': 0x127812,
        'failed': 0x781212,
    },
    messageStatusEmoji: {
        'success': ':white_check_mark:',
        'failed': ':x:',
    },

    weaponColor: 0x1b612e,
    vehicleColor: 0x3498DB,
    generalColor: 0x353635,

    weapons: weapons,
    vehicles: vehicles,

    weaponsMap: toMap(weapons),
    vehiclesMap: toMap(vehicles),
}
