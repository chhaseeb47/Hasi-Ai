const { cmd } = require('../command.js');

const fs = require('fs');

const ffmpeg = require('fluent-ffmpeg');

const path = require('path');

// Create temp directory if it doesn't exist

if (!fs.existsSync('./temp')) {

    fs.mkdirSync('./temp');

}

// Function to generate random file name

function getRandom(ext) {

    return `${Math.floor(Math.random() * 10000)}${ext}`;

}

cmd({

    pattern: "sticker",

    alias: ["s", "stiker"],

    desc: "Convert image/video to sticker",

    category: "converter",

    filename: __filename,

    react: "🔄"

},

async(conn, mek, m, {from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {

    try {

        // Get packname and author from args

        let packname = args[0] ? args[0] : pushname || "Hasi-Ai";

        let author = args[1] ? args[1] : "Bot";

        

        // Function to process media

        const processMedia = async (mediaMsg, mediaType) => {

            // Get the media

            const media = await mediaMsg.download();

            

            // Determine file extension based on mediaType

            const ext = mediaType.includes('video') ? '.mp4' : '.jpg';

            

            // Generate input and output file paths

            const inputFile = path.join('./temp', `input_${getRandom(ext)}`);

            const outputFile = path.join('./temp', `output_${getRandom('.webp')}`);

            

            // Write downloaded media to file

            fs.writeFileSync(inputFile, media);

            

            return new Promise((resolve, reject) => {

                // Create sticker based on media type

                if (mediaType.includes('video')) {

                    // For videos

                    ffmpeg(inputFile)

                        .inputOptions(["-y", "-t", "10"])  // Limit to 10 seconds

                        .outputOptions([

                            "-vcodec", "libwebp", 

                            "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,format=rgba",

                            "-loop", "0", 

                            "-preset", "default", 

                            "-an", 

                            "-vsync", "0",

                            "-compression_level", "3",

                            "-quality", "30"

                        ])

                        .toFormat('webp')

                        .save(outputFile)

                        .on("end", () => {

                            // Send the sticker

                            conn.sendMessage(

                                from, 

                                { sticker: { url: outputFile } }, 

                                { quoted: mek }

                            )

                            .then(() => {

                                // Clean up temp files

                                fs.unlinkSync(inputFile);

                                fs.unlinkSync(outputFile);

                                resolve();

                            })

                            .catch(err => reject(err));

                        })

                        .on("error", (err) => {

                            console.error("FFmpeg error:", err);

                            try { fs.unlinkSync(inputFile); } catch {}

                            reject(err);

                        });

                } else {

                    // For images

                    ffmpeg(inputFile)

                        .outputOptions([

                            "-vcodec", "libwebp",

                            "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,format=rgba",

                            "-compression_level", "3",

                            "-quality", "70"

                        ])

                        .toFormat('webp')

                        .save(outputFile)

                        .on("end", () => {

                            // Send the sticker

                            conn.sendMessage(

                                from, 

                                { sticker: { url: outputFile } }, 

                                { quoted: mek }

                            )

                            .then(() => {

                                // Clean up temp files

                                fs.unlinkSync(inputFile);

                                fs.unlinkSync(outputFile);

                                resolve();

                            })

                            .catch(err => reject(err));

                        })

                        .on("error", (err) => {

                            console.error("FFmpeg error:", err);

                            try { fs.unlinkSync(inputFile); } catch {}

                            reject(err);

                        });

                }

            });

        };

        

        // Check what type of media we're dealing with

        if (m.type === 'imageMessage') {

            reply('⏳ Creating sticker...');

            await processMedia(m, 'imageMessage');

        } else if (m.type === 'videoMessage') {

            reply('⏳ Creating video sticker... This might take a moment.');

            await processMedia(m, 'videoMessage');

        } else if (quoted && quoted.type === 'imageMessage') {

            reply('⏳ Creating sticker from quoted image...');

            await processMedia(quoted, 'imageMessage');

        } else if (quoted && quoted.type === 'videoMessage') {

            reply('⏳ Creating sticker from quoted video... This might take a moment.');

            await processMedia(quoted, 'videoMessage');

        } else {

            reply(`❌ Send an image/video or reply to an image/video with caption ${prefix}sticker`);

        }

    } catch (e) {

        console.error(e);

        reply(`❌ Error creating sticker: ${e.message}`);

    }

});
