async function convertVideo() {
  const url = document.getElementById('videoUrl').value;
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
  }
}
