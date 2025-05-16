const moment = require('moment-timezone');
const { cmd } = require('../command.js');

// Menu command
cmd({
  pattern: "menu",
  desc: "Display bot menu",
  category: "utilities",
  filename: __filename
},
async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
  try {
    // Calculate uptime
    let _uptime = process.uptime() * 1000;
    let days = Math.floor(_uptime / (24 * 60 * 60 * 1000));
    let hours = Math.floor((_uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minutes = Math.floor((_uptime % (60 * 60 * 1000)) / (60 * 1000));
    let seconds = Math.floor((_uptime % (60 * 1000)) / 1000);
    let uptime = `${days} D - ${hours.toString().padStart(2, '0')} H - ${minutes.toString().padStart(2, '0')} m - ${seconds.toString().padStart(2, '0')} s`;

    // Get current time and date
    const time = moment().format("hh:mm A");
    const day = moment().format("dddd");
    const date = moment().format("DD/MM/YYYY");
    
    // Prefix for commands
    const isPrefix = '.';

    // Info section
    const info = `\`\`\`╭═══ LEVANTER ULTRA MAX ═══⊷
┃❃╭──────────────
┃❃│ Prefix : ${isPrefix}
┃❃│ User : ${pushname}
┃❃│ Time : ${time}
┃❃│ Day : ${day}
┃❃│ Date : ${date}
┃❃│ Version : 2.0
┃❃│ Uptime : ${uptime}
┃❃│ Platform : vps (Linux generic)
┃❃╰───────────────
╰═════════════════⊷\`\`\``;

    // Get all commands from command.js
    const commands = require('../command.js').commands;
    
    // Create categories
    let category = {};
    for (let cmd of commands) {
      if (!cmd.category) continue;
      
      if (Object.keys(category).includes(cmd.category)) {
        category[cmd.category].push(cmd);
      } else {
        category[cmd.category] = [];
        category[cmd.category].push(cmd);
      }
    }

    // Sort categories
    const keys = Object.keys(category).sort();
    
    // Create menu text
    let print = info + '\n' + String.fromCharCode(8206).repeat(4001);
    
    // Add commands by category - ONE COMMAND PER LINE
    for (let k of keys) {
      print += '\n\n ╭─❏ *' + k.toUpperCase().split('').map(v => v).join(' ') + '* ❏\n';
      
      // Sort commands in this category
      const cmds = category[k].sort((a, b) => a.pattern.localeCompare(b.pattern));
      
      // Add each command to the output - ONE PER LINE
      cmds.forEach((cmd, i) => {
        // Extract first pattern from command (for commands with multiple patterns)
        const usage = cmd.pattern.split('|')[0];
        
        if (i === cmds.length - 1) {
          print += ` │ ${isPrefix + usage}\n ╰─────────────────`;
        } else {
          print += ` │ ${isPrefix + usage}\n`;
        }
      });
    }
    
    const footer = "> LEVANTER ULTRA MAX 2.0";
    
    // Thumbnail URL
    const thumbnailUrl = "https://files.catbox.moe/jq3aq9.jpg"; // Replace with your preferred image URL
    
    // Send message with image and text
    try {
      await conn.sendMessage(from, {
        image: { url: thumbnailUrl },
        caption: print + '\n\n' + footer
      });
    } catch (imageError) {
      console.error("Failed to send image:", imageError);
      // Fallback to text-only if image fails
      reply(print + '\n\n' + footer);
    }

  } catch (e) {
    console.error(e);
    reply(`Error in menu command: ${e.message}`);
  }
});