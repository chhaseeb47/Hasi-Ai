const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const { cmd } = require('../command');
const { sleep } = require('../lib/function');

cmd({
  pattern: "deploybot",
  desc: "Deploy a secondary bot with your session ID",
  category: "main",
  filename: __filename
},
async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
  try {
    // Check if maximum connections reached (limit to 5)
    const MAX_USERS = 5;
    
    // Count secondary users (excluding main)
    let secondaryCount = 0;
    for (const [id, _] of global.multiConfig.activeUsers) {
      if (id !== 'main') secondaryCount++;
    }
    
    if (secondaryCount >= MAX_USERS) {
      return reply(`❌ Maximum number of connections (${MAX_USERS}) reached. Please try again later.`);
    }

    // Get session ID from args
    const sessionId = q.trim();
    if (!sessionId) {
      return reply("❌ Please provide a valid session ID. Usage: deploybot <sessionId>");
    }

    // Check if this user is already connected
    if (global.multiConfig.activeUsers.has(senderNumber)) {
      return reply("❌ You already have an active connection. Disconnect first with .disconnectbot");
    }

    // Notify user that connection is in progress
    reply("🔄 Connecting your session to the bot...");
    
    try {
      // Create session directory for this user
      const userSessionDir = path.join(global.multiConfig.sessionsDir, senderNumber);
      if (!fs.existsSync(userSessionDir)) {
        fs.mkdirSync(userSessionDir, { recursive: true });
      }
      
      // Download the session file
      try {
        const filer = File.fromURL(`https://mega.nz/file/${sessionId}`);
        
        filer.download((err, data) => {
          if (err) {
            console.error("Session download error:", err);
            reply(`❌ Failed to connect: Invalid session ID or network error.`);
            return;
          }
          
          // Write the session file
          const credPath = path.join(userSessionDir, 'creds.json');
          fs.writeFile(credPath, data, async (err) => {
            if (err) {
              console.error("Session write error:", err);
              reply(`❌ Failed to save session: ${err.message}`);
              return;
            }

            // Connect the session
            try {
              await global.connectToWA(senderNumber, false);
              reply("✅ Successfully connected your bot! You can now use all non-owner commands.");
            } catch (e) {
              console.error("Session connection error:", e);
              reply(`❌ Failed to connect: ${e.message}`);
            }
          });
        });
      } catch (e) {
        console.error("Error downloading session:", e);
        reply(`❌ Failed to download session: ${e.message}`);
      }
    } catch (e) {
      console.error("Session setup error:", e);
      reply(`❌ Connection failed: ${e.message}`);
    }
  } catch (e) {
    console.log(e);
    reply(`❌ Error: ${e.message}`);
  }
});

cmd({
  pattern: "disconnectbot",
  desc: "Disconnect your secondary session",
  category: "main",
  filename: __filename
},
async(conn, mek, m, {from, sender, senderNumber, reply}) => {
  try {
    if (!global.multiConfig.activeUsers.has(senderNumber)) {
      return reply("❌ You don't have an active connection.");
    }
    
    const sessionInfo = global.multiConfig.activeUsers.get(senderNumber);
    
    // Close the connection
    if (sessionInfo.connection) {
      sessionInfo.connection.ev.removeAllListeners();
      sessionInfo.connection.end();
    }
    
    // Clean up the session directory
    const userSessionDir = path.join(global.multiConfig.sessionsDir, senderNumber);
    if (fs.existsSync(userSessionDir)) {
      fs.rmSync(userSessionDir, { recursive: true, force: true });
    }
    
    // Remove from active sessions
    global.multiConfig.activeUsers.delete(senderNumber);
    
    reply("✅ Successfully disconnected your bot.");
    
    // Notify owner
    const mainConn = global.multiConfig.mainConn;
    if (mainConn) {
      await mainConn.sendMessage('923407472645' + "@s.whatsapp.net", {
        text: `📱 User Disconnected\n\nUser: ${senderNumber}\nTime: ${new Date().toISOString()}`
      });
    }
    
  } catch (e) {
    console.log(e);
    reply(`❌ Error: ${e.message}`);
  }
});

cmd({
  pattern: "listconnections",
  desc: "List all active secondary connections",
  category: "owner",
  filename: __filename
},
async(conn, mek, m, {from, isOwner, reply}) => {
  try {
    if (!isOwner) {
      return reply("❌ This command is only for the owner.");
    }
    
    // Count active connections (excluding main)
    let secondaryCount = 0;
    for (const [id, _] of global.multiConfig.activeUsers) {
      if (id !== 'main') secondaryCount++;
    }
    
    if (secondaryCount === 0) {
      return reply("📊 No active secondary connections.");
    }
    
    let message = "📊 Active Secondary Connections:\n\n";
    
    let i = 1;
    for (const [number, session] of global.multiConfig.activeUsers.entries()) {
      if (number === 'main') continue; // Skip main connection
      
      message += `${i}. User: ${number}\n`;
      message += `   Connected Since: ${session.connectedAt}\n\n`;
      i++;
    }
    
    reply(message);
    
  } catch (e) {
    console.log(e);
    reply(`❌ Error: ${e.message}`);
  }
});

module.exports = {};