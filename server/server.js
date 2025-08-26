const express = require('express');
     const ytdl = require('ytdl-core');
     const ffmpeg = require('fluent-ffmpeg');
     const path = require('path');
     const app = express();

     app.use(express.json());
     app.use(express.static(path.join(__dirname, '../public')));

     async function tryGetVideoInfo(url, retries = 2) {
       for (let i = 0; i < retries; i++) {
         try {
           console.log(`Attempt ${i + 1}: Fetching video info for URL: ${url}`);
           return await ytdl.getInfo(url, { 
             requestOptions: { 
               headers: { 
                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
               } 
             } 
           });
         } catch (err) {
           console.error(`Attempt ${i + 1} failed: ${err.message}`);
           if (i === retries - 1) throw err;
           await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
         }
       }
     }

     app.post('/convert', async (req, res) => {
       const { url } = req.body;
       if (!ytdl.validateURL(url)) {
         console.log(`Invalid URL: ${url}`);
         return res.status(400).json({ error: 'Invalid YouTube URL' });
       }
       try {
         const info = await tryGetVideoInfo(url);
         const filename = `video-${Date.now()}.mp4`;
         const outputPath = path.join(__dirname, '../public', filename);
         const stream = ytdl(url, { 
           quality: 'highestvideo', 
           filter: 'audioandvideo',
           requestOptions: { 
             headers: { 
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
             } 
           } 
         });

         console.log(`Starting FFmpeg conversion for ${filename}`);
         ffmpeg(stream)
           .output(outputPath)
           .videoCodec('copy')
           .audioCodec('aac')
           .on('end', () => {
             console.log(`Conversion completed: ${filename}`);
             res.json({ downloadUrl: `/${filename}` });
           })
           .on('error', (err) => {
             console.error(`FFmpeg error: ${err.message}`);
             if (err.message.includes('410')) {
               res.status(410).json({ error: 'HTTP Error 410: Video may be age-restricted or unavailable' });
             } else {
               res.status(500).json({ error: err.message });
             }
           })
           .run();
       } catch (err) {
         console.error(`ytdl-core error: ${err.message}`);
         if (err.message.includes('410')) {
           res.status(410).json({ error: 'HTTP Error 410: Video may be age-restricted or unavailable' });
         } else {
           res.status(500).json({ error: err.message });
         }
       }
     });

     const port = process.env.PORT || 3000;
     app.listen(port, () => console.log(`Server running on port ${port}`));
