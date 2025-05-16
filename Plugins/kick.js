const { cmd } = require('../command.js');

cmd({

    pattern: "kick",

    desc: "Kick a member from the group",

    category: "admin",

    filename: __filename

},

async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

    try {

        // Check if command is used in a group

        if (!isGroup) return reply('⚠️ This command can only be used in groups');

        

        // Check if user is admin

        if (!isAdmins && !isOwner) return reply('⚠️ This command can only be used by group admins or the bot owner');

        

        // Check if bot is admin

        if (!isBotAdmins) return reply('⚠️ I need to be an admin to kick members');

        

        // Get the target - either quoted message or mentioned user or ID

        let users = m.mentionedJid ? m.mentionedJid : m.quoted ? [m.quoted.sender] : [q.replace(/[^0-9]/g, '') + '@s.whatsapp.net'];

        

        // Check if target is specified

        if (users.length === 0 || (users.length === 1 && users[0] === '@s.whatsapp.net')) 

            return reply('❓ Tag a user, reply to their message, or provide their number to kick');

        

        // Check if target is an admin

        for (let user of users) {

            // Skip if user is undefined

            if (!user) continue;

            

            // Check if target is admin

            if (groupAdmins.includes(user)) 

                return reply('⚠️ Cannot kick an admin');

            

            // Try to kick user

            await conn.groupParticipantsUpdate(from, [user], 'remove')

                .then(() => reply(`👢 Successfully kicked @${user.split('@')[0]}`, {mentions: [user]}))

                .catch(err => reply('❌ Error: ' + err));

        }

    } catch (e) {

        console.log(e);

        reply(`Error: ${e}`);

    }

});