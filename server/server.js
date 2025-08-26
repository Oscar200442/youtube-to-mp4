const express = require('express');
     const ytdl = require('ytdl-core');
     const ffmpeg = require('fluent-ffmpeg');
     const path = require('path');
     const app = express();

     app.use(express.json());
     app.use(express.static(path.join(__dirname, '../public')));

     app.post('/convert', async (req, res) => {
       const { url } = req.body;
       if (!ytdl.validateURL(url)) {
         return res.status(400).json({ error: 'Invalid YouTube URL' });
       }
       try {
         console.log(`Fetching video info for URL: ${url}`);
         const info = await ytdl.getInfo(url, { requestOptions: { headers: { 'User-Agent': 'Mozilla/5.0' } } });
         const filename = `video-${Date.now()}.mp4`;
         const outputPath = path.join(__dirname, '../public', filename);
         const stream = ytdl(url, { quality: 'highestvideo', filter: 'audioandvideo' });

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
