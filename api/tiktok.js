const fetch = require('node-fetch');

async function fetchText(url){
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  return await r.text();
}

module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'missing url' });
  try{
    // try oembed
    let title = '';
    let channel = '';
    let thumbnail = '';
    try{
      const oembedRes = await fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(url), { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (oembedRes.ok){
        const o = await oembedRes.json();
        title = o.title || '';
        channel = o.author_name ? (o.author_name.startsWith('@') ? o.author_name : '@'+o.author_name) : '';
        thumbnail = o.thumbnail_url || '';
      }
    }catch(e){/* ignore */}

    const html = await fetchText(url);
    let uploadIso = null;
    const sigiMatch = html.match(/<script id="SIGI_STATE">(.*?)<\/script>/s);
    if (sigiMatch && sigiMatch[1]){
      try{
        const sig = JSON.parse(sigiMatch[1]);
        const itemModule = sig.ItemModule || {};
        const itemKeys = Object.keys(itemModule);
        if (itemKeys.length > 0){
          const item = itemModule[itemKeys[0]];
          if (!title && item.desc) title = item.desc;
          if (!thumbnail && item.video && item.video.cover) thumbnail = item.video.cover;
          if (item.createTime){
            const d = new Date(item.createTime*1000);
            if (!isNaN(d)) uploadIso = d.toISOString();
          }
          if (!channel){
            const author = item.author || item.authorName || null;
            if (author) channel = author.startsWith('@') ? author : '@'+author;
          }
        }
      }catch(e){/* ignore */}
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ title, channel, thumbnail, uploadDate: uploadIso }));
  }catch(err){
    res.status(500).json({ error: err.toString() });
  }
};
