const { cmd } = require('../command.js');

const fs = require('fs');

const path = require('path');

// Global variable to track no-prefix state

// This allows the setting to persist while the bot is running

global.noPrefixMode = false;

cmd({

    pattern: "noprefix",

    desc: "Toggle no-prefix mode on/off",

    category: "owner",

    filename: __filename

},

async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

    try {

        // Only allow owners to toggle this setting

        if (!isOwner) {

            return reply("❌ This command can only be used by the bot owner!");

        }

        

        // Toggle the setting based on args

        if (args[0] === "on") {

            global.noPrefixMode = true;

            reply("✅ No-prefix mode has been *enabled*. Commands can be used without a prefix.");

        } else if (args[0] === "off") {

            global.noPrefixMode = false;

            reply("✅ No-prefix mode has been *disabled*. Commands now require a prefix.");

        } else {

            // Toggle if no specific argument is provided

            global.noPrefixMode = !global.noPrefixMode;

            reply(`🔄 No-prefix mode has been *${global.noPrefixMode ? 'enabled' : 'disabled'}*.`);

        }

        

    } catch (e) {

        console.log(e);

        reply(`Error: ${e}`);

    }

})