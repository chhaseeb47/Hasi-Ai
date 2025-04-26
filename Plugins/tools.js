const { cmd } = require('../command.js');
const {
  runtime,
  getRandom,
  Json,
  h2k,
  fetchJson,
  isUrl
} = require('../lib/functions.js');

// !runtime
cmd({
  pattern: 'runtime',
  desc: 'Shows bot uptime',
  category: 'tools',
  filename: __filename
}, async (m) => {
  const time = process.uptime();
  m.reply(`⏱ Runtime: ${runtime(time)}`);
});

// !random
cmd({
  pattern: 'random ?(.*)',
  desc: 'Generates a random number with extension',
  category: 'tools',
  filename: __filename
}, async (m, text) => {
  const ext = text || '.txt';
  m.reply(getRandom(ext));
});

// !json
cmd({
  pattern: 'json ?(.*)',
  desc: 'Returns formatted JSON string',
  category: 'tools',
  filename: __filename
}, async (m, text) => {
  if (!text) return m.reply('Provide some text or data.');
  m.reply(Json(text));
});

// !h2k
cmd({
  pattern: 'h2k ?(.*)',
  desc: 'Converts number to human readable format',
  category: 'tools',
  filename: __filename
}, async (m, text) => {
  const num = parseInt(text);
  if (isNaN(num)) return m.reply('Please enter a valid number.');
  m.reply(h2k(num));
});

// !fetchjson
cmd({
  pattern: 'fetchjson ?(.*)',
  desc: 'Fetches and returns JSON from a URL',
  category: 'tools',
  filename: __filename
}, async (m, url) => {
  if (!url || !isUrl(url)) return m.reply('Please enter a valid URL.');
  const data = await fetchJson(url);
  m.reply(Json(data));
});

// !isurl
cmd({
  pattern: 'isurl ?(.*)',
  desc: 'Checks if a string is a valid URL',
  category: 'tools',
  filename: __filename
}, async (m, text) => {
  const valid = isUrl(text);
  m.reply(valid ? '✅ Valid URL' : '❌ Not a URL');
});
