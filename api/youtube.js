const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchText(url){
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  return await r.text();
}

module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'missing url' });
  try{
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
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ title, channel, thumbnail, uploadDate: iso }));
  }catch(err){
    res.status(500).json({ error: err.toString() });
  }
};
