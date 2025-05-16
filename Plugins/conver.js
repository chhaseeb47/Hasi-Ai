const { cmd } = require('../command');

const fs = require('fs');

const { exec } = require('child_process');

const { tmpdir } = require('os');

const path = require('path');

// Helper function to generate random filenames

const generateFilename = () => {

   return Math.floor(Math.random() * 10000);

};

// Command to convert to mp3

cmd({

   pattern: "tomp3",

   desc: "Convert video/audio to MP3 file",

   category: "converter",

   react: "🎧",

   filename: __filename

},

async(conn, mek, m, {from, reply}) => {

   try {

      // Check if replying to a message

      if (!m.quoted) {

         return reply('❌ Reply to a video or audio to convert it to MP3!');

      }

      // Debug message to check what type of quoted message we have

      console.log("Quoted message type:", m.quoted.type);

      

      // Check if media type is supported

      if (m.quoted.type !== 'videoMessage' && m.quoted.type !== 'audioMessage' && m.quoted.type !== 'documentMessage') {

         return reply('❌ Please reply to a valid video or audio message!');

      }

      

      // Show reaction to indicate processing

      await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

      

      // Send initial processing message

      reply('⏳ Converting to MP3...');

      

      try {

         // Generate random names for files

         const randomName = generateFilename();

         

         // Download the media file using the bot's built-in download method

         const mediaBuffer = await m.quoted.download(randomName);

         

         if (!mediaBuffer) {

            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

            return reply('❌ Failed to download media. Please try again with a recent message.');

         }

         

         // The input file path is determined by the media type

         let inputPath;

         if (m.quoted.type === 'videoMessage') {

            inputPath = `${randomName}.mp4`;

         } else if (m.quoted.type === 'audioMessage') {

            inputPath = `${randomName}.mp3`;

         } else if (m.quoted.type === 'documentMessage') {

            // Check file extension for document

            const fileName = m.quoted.msg.fileName || '';

            const fileExt = fileName.split('.').pop().toLowerCase();

            if (['mp3', 'mp4', 'mpeg', 'mpga', 'wav', 'ogg', 'm4a'].includes(fileExt)) {

               inputPath = `${randomName}.${fileExt}`;

            } else {

               await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

               return reply('❌ Unsupported document file type. Please use audio or video files.');

            }

         }

         

         // Output MP3 file

         const outputPath = `${randomName}_converted.mp3`;

         

         // Convert using ffmpeg

         exec(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 192k -f mp3 ${outputPath}`, async (error) => {

            // Try to clean up input file

            try {

               fs.unlinkSync(inputPath);

            } catch (err) {

               console.error('Error deleting input file:', err);

            }

            

            if (error) {

               console.error('FFmpeg error:', error);

               await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

               return reply(`❌ Conversion failed: ${error.message}`);

            }

            

            try {

               // Read output file

               const audioBuffer = fs.readFileSync(outputPath);

               

               // Send as audio

               await conn.sendMessage(from, {

                  audio: audioBuffer,

                  mimetype: 'audio/mp3'

               }, { quoted: mek });

               

               // Success reaction

               await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

               

               // Clean up output file

               fs.unlinkSync(outputPath);

               

            } catch (sendErr) {

               console.error('Error sending audio:', sendErr);

               await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

               reply(`❌ Error sending converted audio: ${sendErr.message}`);

            }

         });

      } catch (downloadErr) {

         console.error('Error in media processing:', downloadErr);

         await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

         reply('❌ Could not process the media. Please try again with a recent message.');

      }

   } catch (e) {

      console.error('Main error:', e);

      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

      reply(`❌ Error: ${e.message}`);

   }

});

// Command for voice note conversion

cmd({

   pattern: "tovn",

   desc: "Convert video/audio to voice note",

   alias: ["tovoice"],

   category: "converter",

   react: "🎤",

   filename: __filename

},

async(conn, mek, m, {from, reply}) => {

   try {

      // Check if replying to a message

      if (!m.quoted) {

         return reply('❌ Reply to a video or audio to convert it to voice note!');

      }

      

      // Debug message to check what type of quoted message we have

      console.log("Quoted message type:", m.quoted.type);

      

      // Check if media type is supported

      if (m.quoted.type !== 'videoMessage' && m.quoted.type !== 'audioMessage' && m.quoted.type !== 'documentMessage') {

         return reply('❌ Please reply to a valid video or audio message!');

      }

      

      // Show reaction to indicate processing

      await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

      

      // Send initial processing message

      reply('⏳ Converting to voice note...');

      

      try {

         // Generate random names for files

         const randomName = generateFilename();

         

         // Download the media file using the bot's built-in download method

         const mediaBuffer = await m.quoted.download(randomName);

         

         if (!mediaBuffer) {

            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

            return reply('❌ Failed to download media. Please try again with a recent message.');

         }

         

         // The input file path is determined by the media type

         let inputPath;

         if (m.quoted.type === 'videoMessage') {

            inputPath = `${randomName}.mp4`;

         } else if (m.quoted.type === 'audioMessage') {

            inputPath = `${randomName}.mp3`;

         } else if (m.quoted.type === 'documentMessage') {

            // Check file extension for document

            const fileName = m.quoted.msg.fileName || '';

            const fileExt = fileName.split('.').pop().toLowerCase();

            if (['mp3', 'mp4', 'mpeg', 'mpga', 'wav', 'ogg', 'm4a'].includes(fileExt)) {

               inputPath = `${randomName}.${fileExt}`;

            } else {

               await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

               return reply('❌ Unsupported document file type. Please use audio or video files.');

            }

         }

         

         // Output MP3 file for voice note

         const outputPath = `${randomName}_converted.mp3`;

         

         // Convert using ffmpeg - for voice note, mono channel with lower bitrate

         exec(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 1 -b:a 128k -f mp3 ${outputPath}`, async (error) => {

            // Try to clean up input file

            try {

               fs.unlinkSync(inputPath);

            } catch (err) {

               console.error('Error deleting input file:', err);

            }

            

            if (error) {

               console.error('FFmpeg error:', error);

               await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

               return reply(`❌ Conversion failed: ${error.message}`);

            }

            

            try {

               // Read output file

               const audioBuffer = fs.readFileSync(outputPath);

               

               // Send as voice note with ptt:true

               await conn.sendMessage(from, {

                  audio: audioBuffer,

                  mimetype: 'audio/mp4',

                  ptt: true

               }, { quoted: mek });

               

               // Success reaction

               await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

               

               // Clean up output file

               fs.unlinkSync(outputPath);

               

            } catch (sendErr) {

               console.error('Error sending voice note:', sendErr);

               await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

               reply(`❌ Error sending converted voice note: ${sendErr.message}`);

            }

         });

      } catch (downloadErr) {

         console.error('Error in media processing:', downloadErr);

         await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

         reply('❌ Could not process the media. Please try again with a recent message.');

      }

   } catch (e) {

      console.error('Main error:', e);

      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

      reply(`❌ Error: ${e.message}`);

   }

});