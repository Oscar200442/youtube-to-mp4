async function convertVideo() {
  const url = document.getElementById('videoUrl').value;
  if (!url) {
    alert('Please enter a YouTube URL');
    return;
  }
  try {
    const response = await fetch('/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (data.downloadUrl) {
      const link = document.getElementById('downloadLink');
      link.href = data.downloadUrl;
      link.style.display = 'block';
      link.textContent = 'Download MP4';
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Failed to convert video: ' + err.message);
  }
}
