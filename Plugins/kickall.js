const { cmd } = require('../command.js');

cmd({

    pattern: "kickall",

    desc: "Remove all non-admin members from the group immediately",

    category: "admin",

    filename: __filename,

    use: "",

    react: "⚠️"

},

async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

    try {

        // Check if in group

        if (!isGroup) {

            return reply('❌ This command can only be used in groups!');

        }

        

        // Check if user is admin

        if (!isAdmins && !isOwner) {

            return reply('❌ This command can only be used by group admins!');

        }

        

        // Check if bot is admin

        if (!isBotAdmins) {

            return reply('❌ I need to be an admin to perform this action!');

        }

        // Add confirmation step for safety

        if (!q || q.toLowerCase() !== 'confirm') {

            return reply(`⚠️ *WARNING: MASS REMOVAL* ⚠️\n\nThis command will immediately kick ALL non-admin members from the group!\n\nTo confirm, type:\n\n*.kickall confirm*\n\nThis action cannot be undone.`);

        }

        

        // Get all participants and filter out admins

        const groupMembers = participants;

        const nonAdmins = groupMembers.filter(p => !p.admin);

        

        if (nonAdmins.length === 0) {

            return reply('🚩 No non-admin members to remove.');

        }

        

        // Extract JIDs of all non-admin members

        const nonAdminJids = nonAdmins.map(p => p.id);

        

        // Notify group that mass removal is starting

        await reply(`⚠️ Removing all ${nonAdminJids.length} non-admin members immediately...`);

        

        try {

            // Remove all non-admin members at once in a single API call

            const results = await conn.groupParticipantsUpdate(from, nonAdminJids, 'remove');

            

            // Count successes and failures

            let successCount = 0;

            let failCount = 0;

            

            results.forEach(result => {

                if (result.status === '200') {

                    successCount++;

                } else {

                    failCount++;

                }

            });

            

            // Send final report

            reply(`✅ Mass removal completed:\n- Successfully removed: ${successCount} members\n- Failed to remove: ${failCount} members`);

            

        } catch (error) {

            console.error('Error during mass removal:', error);

            reply(`❌ Error occurred during mass removal: ${error.message}`);

        }

        

    } catch (e) {

        console.error(e);

        reply(`❌ Error: ${e.message}`);

    }

});