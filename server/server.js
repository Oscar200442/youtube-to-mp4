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
    const info = await ytdl.getInfo(url);
    const filename = `video-${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, '../public', filename);
    const stream = ytdl(url, { quality: 'highestvideo' });
    
    ffmpeg(stream)
      .output(outputPath)
      .videoCodec('copy')
      .audioCodec('aac')
      .on('end', () => {
        res.json({ downloadUrl: `/${filename}` });
      })
      .on('error', (err) => {
        res.status(500).json({ error: err.message });
      })
      .run();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
