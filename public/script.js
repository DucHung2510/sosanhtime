// Lightweight helper
const el = id => document.getElementById(id);

async function fetchApi(path, url){
  const res = await fetch(path + '?url=' + encodeURIComponent(url));
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

function pad(n){return String(n).padStart(2,'0')}

function isoToDateTimeParts(iso){
  if(!iso) return {date:'',time:'',dateObj:null};
  const d = new Date(iso);
  if(isNaN(d)) return {date:'',time:'',dateObj:null};
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth()+1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return {date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}:${ss}`, dateObj: d};
}

function setThumb(containerId, url){
  const wrap = el(containerId);
  if(!url){ wrap.innerHTML = '<div class="placeholder">Chưa có thumbnail</div>'; return; }
  wrap.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  wrap.appendChild(img);
}

async function handleFetch(platform){
  const url = el(platform === 'yt' ? 'yt-url' : 'tt-url').value.trim();
  const errEl = el(platform === 'yt' ? 'yt-error' : 'tt-error');
  errEl.textContent = '';
  if(!url){ errEl.textContent = 'Vui lòng nhập link'; return; }
  try{
    const data = await fetchApi(platform === 'yt' ? '/api/youtube' : '/api/tiktok', url);
    // populate
    if(platform === 'yt'){
      el('yt-channel').value = data.channel || '';
      el('yt-title').value = data.title || '';
      const parts = isoToDateTimeParts(data.uploadDate);
      if(parts.date) el('yt-date').value = parts.date;
      if(parts.time) el('yt-time').value = parts.time;
      setThumb('yt-thumb', data.thumbnail);
    } else {
      el('tt-channel').value = data.channel || '';
      el('tt-title').value = data.title || '';
      const parts = isoToDateTimeParts(data.uploadDate);
      if(parts.date) el('tt-date').value = parts.date;
      if(parts.time) el('tt-time').value = parts.time;
      setThumb('tt-thumb', data.thumbnail);
    }
    computeAndRender();
  }catch(e){
    errEl.textContent = e.message || String(e);
  }
}

function readDateTimeFromInputs(prefix){
  const dateVal = el(prefix + '-date').value; // yyyy-mm-dd
  const timeVal = el(prefix + '-time').value; // HH:MM[:SS]
  if(!dateVal) return null;
  const t = timeVal || '00:00:00';
  // ensure seconds
  const parts = t.split(':');
  while(parts.length<3) parts.push('00');
  const iso = dateVal + 'T' + parts.join(':');
  const d = new Date(iso);
  return isNaN(d) ? null : d;
}

function computeAndRender(){
  const dY = readDateTimeFromInputs('yt');
  const dT = readDateTimeFromInputs('tt');
  const resultArea = el('result-area');
  const markerY = el('marker-yt');
  const markerT = el('marker-tt');
  const labelY = el('marker-yt-label');
  const labelT = el('marker-tt-label');
  if(!dY || !dT){
    // show placeholder
    markerY.style.display = 'none';
    markerT.style.display = 'none';
    resultArea.innerHTML = '<div class="placeholder-result">Nhập đầy đủ ngày + giờ đăng ở cả 2 bên để xem chênh lệch</div>';
    return;
  }

  // compute difference in minutes
  const diffMs = dT.getTime() - dY.getTime();
  const diffMin = Math.round(diffMs/60000);

  // render result text
  let text = '';
  if(diffMin === 0) text = '<div class="result">Cùng thời điểm</div>';
  else if(diffMin > 0) text = `<div class="result">Tiktok up sau Youtube <span class="amount">${diffMin} phút</span></div>`;
  else text = `<div class="result">Tiktok up trước Youtube <span class="amount">${Math.abs(diffMin)} phút</span></div>`;

  // position markers along the track between 8% and 92% based on relative times
  const minTime = Math.min(dY.getTime(), dT.getTime());
  const maxTime = Math.max(dY.getTime(), dT.getTime());
  const range = Math.max(1, maxTime - minTime);
  const posY = ((dY.getTime() - minTime) / range) * 84 + 8; // 8..92
  const posT = ((dT.getTime() - minTime) / range) * 84 + 8;

  markerY.style.left = posY + '%'; markerY.style.display = 'block';
  markerT.style.left = posT + '%'; markerT.style.display = 'block';
  labelY.textContent = `${dY.toLocaleDateString()} ${pad(dY.getHours())}:${pad(dY.getMinutes())}:${pad(dY.getSeconds())}`;
  labelT.textContent = `${dT.toLocaleDateString()} ${pad(dT.getHours())}:${pad(dT.getMinutes())}:${pad(dT.getSeconds())}`;

  resultArea.innerHTML = text + `<div class="result-sub">YouTube: ${el('yt-title').value || '—'} • TikTok: ${el('tt-title').value || '—'}</div>`;
}

// attach handlers
document.addEventListener('click', e => {
  if(e.target && e.target.id === 'yt-fetch') handleFetch('yt');
  if(e.target && e.target.id === 'tt-fetch') handleFetch('tt');
});

['yt-date','yt-time','tt-date','tt-time','yt-title','tt-title'].forEach(id =>{
  const node = el(id);
  if(node) node.addEventListener('input', computeAndRender);
});

