const { cmd } = require('../command.js');
const { getBuffer, isUrl } = require('../lib/functions.js');

cmd({
  pattern: 'getbuffer ?(.*)',
  desc: 'Fetches a file buffer from a URL and sends it',
  category: 'tools',
  filename: __filename
}, async (m, url) => {
  if (!url || !isUrl(url)) return m.reply('Please provide a valid file URL.');

  try {
    const buffer = await getBuffer(url);
    let fileType = url.split('.').pop().split('?')[0];
    let fileName = `file.${fileType}`;

    await m.client.sendMessage(m.chat, {
      document: buffer,
      fileName: fileName,
      mimetype: `application/${fileType}`
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply('❌ Could not fetch or send the file.');
  }
});
