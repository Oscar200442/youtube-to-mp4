const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/convert', async (req, res) => {
  const { url } = req.body;
  try {
    const info = await ytdl.getInfo(url);
    const stream = ytdl(url, { quality: 'highestvideo' });
    const filename = `video-${Date.now()}.mp4`;
    ffmpeg(stream)
      .output(filename)
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

app.listen(3000, () => console.log('Server running on port 3000'));
