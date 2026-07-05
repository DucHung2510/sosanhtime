// Lightweight helper
// Simple client-only logic: use oEmbed for thumbnails and titles; user supplies date/time
const el = id => document.getElementById(id);

async function fetchOEmbed(url){
  try{
    // Try YouTube oEmbed first, then TikTok; both support oEmbed
    const res = await fetch('/.netlify/functions/proxy?url=' + encodeURIComponent(url));
    // If a proxy is not available, try direct fetch (may fail due to CORS)
    if(res.ok){
      return await res.json();
    }
  }catch(e){
    // ignore
  }
  // fallback: try direct YouTube oembed
  try{
    const y = await fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json');
    if(y.ok) return await y.json();
  }catch(e){}
  try{
    const t = await fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(url));
    if(t.ok) return await t.json();
  }catch(e){}
  throw new Error('Không lấy được oEmbed. Có thể do CORS — nhập tiêu đề/kênh bằng tay.');
}

function setThumb(id, url){
  const wrap = el(id);
  if(!url){ wrap.innerHTML = 'Thumbnail'; return; }
  wrap.innerHTML = '';
  const img = document.createElement('img'); img.src = url; wrap.appendChild(img);
}

async function onFetchClick(kind){
  const url = el(kind === 'yt' ? 'yt-url' : 'tt-url').value.trim();
  if(!url) return alert('Nhập đường link');
  try{
    const o = await fetchOEmbed(url);
    // oembed fields: title, author_name, thumbnail_url
    if(kind === 'yt'){
      el('yt-channel').textContent = o.author_name || '—';
      el('yt-title').textContent = o.title || '—';
      setThumb('yt-thumb', o.thumbnail_url || '');
    } else {
      el('tt-channel').textContent = o.author_name ? (o.author_name.startsWith('@')?o.author_name:'@'+o.author_name) : '—';
      el('tt-title').textContent = o.title || '—';
      setThumb('tt-thumb', o.thumbnail_url || '');
    }
  }catch(err){
    alert(err.message || String(err));
  }
}

function readDT(prefix){
  const d = el(prefix+'-date').value; const t = el(prefix+'-time').value || '00:00:00';
  if(!d) return null;
  const parts = t.split(':'); while(parts.length<3) parts.push('00');
  const iso = d + 'T' + parts.join(':');
  const dt = new Date(iso);
  return isNaN(dt) ? null : dt;
}

function compute(){
  const y = readDT('yt'); const tt = readDT('tt'); const out = el('compare');
  if(!y || !tt){ out.innerHTML = 'Nhập ngày + giờ ở cả hai bên để so sánh.'; return; }
  const diffMin = Math.round((tt.getTime()-y.getTime())/60000);
  if(diffMin === 0) out.innerHTML = '<strong>Cùng thời điểm</strong>';
  else if(diffMin>0) out.innerHTML = `<strong>TikTok up sau YouTube ${diffMin} phút</strong>`;
  else out.innerHTML = `<strong>TikTok up trước YouTube ${Math.abs(diffMin)} phút</strong>`;
}

document.addEventListener('click', e=>{
  if(e.target.id === 'yt-fetch') onFetchClick('yt');
  if(e.target.id === 'tt-fetch') onFetchClick('tt');
});

['yt-date','yt-time','tt-date','tt-time'].forEach(id=>{ const n=el(id); if(n) n.addEventListener('input', compute);});


