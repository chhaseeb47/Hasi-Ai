const { cmd } = require('../command.js');

const axios = require('axios');

// API configuration

const API_KEY = 'fuckoff'; // Your API key

const API_URL = 'https://api.neoxr.my.id/api';

// Function to make API calls to neoxr

async function callNeoxrApi(endpoint, params) {

  try {

    const response = await axios.get(`${API_URL}${endpoint}`, {

      params: {

        ...params,

        apikey: API_KEY

      }

    });

    return response.data;

  } catch (error) {

    console.error('API Error:', error);

    return { status: false, message: error.message };

  }

}

// AI Command using Gemini but with pattern "ai"

cmd({

  pattern: "ai",

  desc: "Get AI response in French using Gemini",

  category: "utilities",

  filename: __filename

},

async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

  try {

    // Check if prompt is provided

    if (!q) return reply(`Veuillez fournir une requête. Exemple: .ai parlez-moi de l'espace`);

    

    // Show typing indicator

    await conn.sendPresenceUpdate('composing', from);

    

    // React to message to indicate processing

    await conn.sendMessage(from, { react: { text: '🕒', key: mek.key } });

    

    // Modify the query to request French response

    const frenchPrompt = `Veuillez répondre en français: ${q}`;

    

    // Call the Gemini API instead of GPT-Pro

    const json = await callNeoxrApi('/gemini-chat', { q: frenchPrompt });

    

    // Handle API response

    if (!json.status) return reply(`Erreur: ${JSON.stringify(json)}`);

    

    // Send the AI response

    reply(json.data.message);

    

    // React to indicate completion

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    

  } catch (e) {

    console.log(e);

    reply(`Erreur: ${JSON.stringify(e)}`);

    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

  }

});