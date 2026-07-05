const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  return await res.text();
}

app.get('/api/youtube', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'missing url' });
  try {
    const html = await fetchText(url);
    const $ = cheerio.load(html);
    let ld = null;
    const ldText = $('script[type="application/ld+json"]').first().text();
    if (ldText) {
      try { ld = JSON.parse(ldText); } catch (e) { ld = null; }
    }
    let title = (ld && ld.name) || $('meta[name="title"]').attr('content') || $('title').text() || '';
    let channel = (ld && ld.author && ld.author.name) || $('meta[itemprop="author"]').attr('content') || '';
    let thumbnail = null;
    if (ld && ld.thumbnailUrl) thumbnail = Array.isArray(ld.thumbnailUrl) ? ld.thumbnailUrl[0] : ld.thumbnailUrl;
    if (!thumbnail) thumbnail = $('meta[property="og:image"]').attr('content') || $('link[itemprop="thumbnailUrl"]').attr('href') || null;
    let uploadDate = null;
    if (ld && (ld.uploadDate || ld.datePublished)) uploadDate = (ld.uploadDate || ld.datePublished);
    if (!uploadDate) {
      const m = html.match(/"datePublished":"([\d-:TZ.+]+)"/);
      if (m) uploadDate = m[1];
    }
    let iso = null;
    if (uploadDate) {
      const d = new Date(uploadDate);
      if (!isNaN(d)) iso = d.toISOString();
    }
    res.json({ title, channel, thumbnail, uploadDate: iso });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/api/tiktok', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'missing url' });
  try {
    let title = '';
    let channel = '';
    let thumbnail = '';
    try {
      const oembedRes = await fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(url), { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (oembedRes.ok) {
        const o = await oembedRes.json();
        title = o.title || '';
        channel = o.author_name ? (o.author_name.startsWith('@') ? o.author_name : '@' + o.author_name) : '';
        thumbnail = o.thumbnail_url || '';
      }
    } catch (e) {}

    const html = await fetchText(url);
    let uploadIso = null;
    const sigiMatch = html.match(/<script id="SIGI_STATE">(.*?)<\/script>/s);
    if (sigiMatch && sigiMatch[1]) {
      try {
        const sig = JSON.parse(sigiMatch[1]);
        const itemModule = sig.ItemModule || {};
        const itemKeys = Object.keys(itemModule);
        if (itemKeys.length > 0) {
          const item = itemModule[itemKeys[0]];
          if (!title && item.desc) title = item.desc;
          if (!thumbnail && item.video && item.video.cover) thumbnail = item.video.cover;
          if (item.createTime) {
            const d = new Date(item.createTime * 1000);
            if (!isNaN(d)) uploadIso = d.toISOString();
          }
          if (!channel) {
            const author = item.author || item.authorName || null;
            if (author) channel = author.startsWith('@') ? author : '@' + author;
          }
        }
      } catch (e) {}
    }

    res.json({ title, channel, thumbnail, uploadDate: uploadIso });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
