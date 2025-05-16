const { cmd } = require('../command.js');

cmd({

    pattern: "add",

    desc: "Add a user to the group",

    category: "group",

    filename: __filename,

    react: "➕"

},

async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

    try {

        // Check if it's a group chat

        if (!isGroup) {

            return reply('❌ This command can only be used in groups!');

        }

        

        // Check if bot is admin

        if (!isBotAdmins) {

            return reply('❌ I need admin privileges to add members!');

        }

        

        // Check if sender is admin or owner

        if (!isAdmins && !isOwner) {

            return reply('❌ Only admins can add members!');

        }

        

        // Get the phone numbers to add

        let users = args.join(' ').split(',').map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v.length > 13);

        

        // Check if any numbers were provided

        if (users.length === 0) {

            // If there's a quoted message, try to add the sender of that message

            if (m.quoted) {

                users = [m.quoted.sender];

            } else {

                // Show usage instructions

                return reply(`❌ Please provide phone numbers to add!\n\nExample: ${prefix}add 123456789,987654321\nor reply to someone's message with ${prefix}add`);

            }

        }

        

        // Add the users

        reply(`🔄 Adding ${users.length} user(s) to the group...`);

        

        // Track successful and failed additions

        let added = 0;

        let failed = 0;

        let errorMsg = '';

        

        for (const user of users) {

            try {

                await conn.groupParticipantsUpdate(from, [user], "add");

                added++;

            } catch (err) {

                failed++;

                console.error(`Failed to add ${user}:`, err);

                errorMsg += `\n- Failed to add ${user.split('@')[0]}: ${err.message || 'Unknown error'}`;

            }

            

            // Small delay to prevent rate limiting

            await new Promise(resolve => setTimeout(resolve, 1000));

        }

        

        // Send completion message

        let resultMsg = `✅ Added ${added} user(s) to the group.`;

        if (failed > 0) {

            resultMsg += `\n❌ Failed to add ${failed} user(s).${errorMsg}`;

        }

        

        reply(resultMsg);

        

    } catch (e) {

        console.error(e);

        reply(`❌ Error: ${e.message}`);

    }

});