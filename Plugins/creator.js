const { cmd } = require('../command.js');

// Set the owner's details here

const ownerNumber = '13056978303'; // Replace with the owner's number

const ownerName = 'Bot Creator'; // Replace with the owner's name

cmd({

    pattern: "owner",

    desc: "Provides the creator's contact information",

    category: "general",

    filename: __filename

},

async (conn, mek, m, { from, sender, reply }) => {

    try {

        // Compose the text message with the owner's contact information

        const message = `

📌 *Bot Creator Information*

• Name: *${ownerName}*

• Contact: +${ownerNumber}

💡 Please contact the owner for important matters only.

        `.trim();

        // Send the text message

        await conn.sendMessage(from, {

            text: message

        }, { quoted: mek });

        // Send the owner's contact as a vCard

        const vCard = `

BEGIN:VCARD

VERSION:3.0

FN:${ownerName}

TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}

END:VCARD

        `.trim();

        await conn.sendMessage(from, {

            contacts: {

                displayName: ownerName,

                contacts: [{ vcard: vCard }]

            }

        }, { quoted: mek });

    } catch (e) {

        console.error('Error in owner command:', e);

        reply(`❌ An error occurred while trying to fetch the owner's information.`);

    }

});