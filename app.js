const KEY = 'pubg-scoreboard-v1';
const SUPABASE_URL = 'https://dfjffbzbmkitmnsiifib.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ntEqcHgqsbxQbg_18j_ztg_IdYZcyfu';
const db = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pubg-scoreboard') : null;
const initialTeams = ['NEXLABS','KRAKEN','RAVEN','KAZE','VIRE','NOVA','BLITZ','SRI','TITAN','ECHO'].map((name, i) => ({ id: crypto.randomUUID(), name, score: Math.max(0, 22 - i * 2), logo: '' }));
const app = document.querySelector('#app');

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || initialTeams; } catch { return initialTeams; } }
let teams = load();
let history = [];
let persistedIds = new Set();
let signedInUser = null;
const save = () => { localStorage.setItem(KEY, JSON.stringify(teams)); channel?.postMessage(teams); if (db) syncSupabase(); else fetch('/api/state', {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(teams)}).catch(() => {}); render(); };
const remember = () => { history.push(JSON.stringify(teams)); if (history.length > 20) history.shift(); };
async function loadSupabase() {
  if (!db) return;
  const { data: session } = await db.auth.getSession(); signedInUser = session.session?.user || null;
  const { data, error } = await db.from('teams').select('*');
  if (!error && data?.length) { teams = data; persistedIds = new Set(data.map(t => t.id)); render(); }
}
async function syncSupabase() {
  if (!signedInUser) return;
  const ids = new Set(teams.map(t => t.id));
  const removed = [...persistedIds].filter(id => !ids.has(id));
  if (removed.length) await db.from('teams').delete().in('id', removed);
  const { error } = await db.from('teams').upsert(teams);
  if (error) return alert(`บันทึก Supabase ไม่สำเร็จ: ${error.message}`);
  persistedIds = ids;
}
function requireAdmin() { if (!db || signedInUser) return true; alert('กรุณาล็อกอินแอดมินก่อนแก้คะแนน'); return false; }
async function loginAdmin() {
  const email = prompt('อีเมลแอดมิน Supabase'); if (!email) return;
  const password = prompt('รหัสผ่าน'); if (!password) return;
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return alert(`ล็อกอินไม่สำเร็จ: ${error.message}`);
  await loadSupabase(); render();
}
const sorted = () => [...teams].sort((a,b) => b.score - a.score || a.name.localeCompare(b.name));
const esc = (text) => String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const logo = (team) => team.logo ? `<img class="logo" src="${esc(team.logo)}" onerror="this.remove()" alt="">` : `<span class="logo"></span>`;
const links = (active) => `<nav class="nav"><a class="${active==='admin'?'active':''}" href="?view=admin">ควบคุมคะแนน</a><a class="${active==='live'?'active':''}" href="?view=live">ดูคะแนนสด</a><a href="?view=overlay" target="_blank">เปิด Overlay OBS</a></nav>`;

function admin() {
  const rows = sorted().map((t,i) => `<div class="team-row score-grid"><div class="rank">${i+1}</div><div class="team-name">${logo(t)}<span class="team-title">${esc(t.name)}</span></div><div class="score">${t.score}</div><div class="controls"><button class="round minus" data-change="-1" data-id="${t.id}">−</button><button class="round plus" data-change="1" data-id="${t.id}">+</button><button class="round" data-remove="${t.id}" title="ลบทีม">×</button></div></div>`).join('');
  document.body.className = '';
  const auth = db ? (signedInUser ? `<button id="logout" class="button">ออกจากระบบ</button>` : `<button id="login" class="button primary">ล็อกอินแอดมิน</button>`) : '';
  app.innerHTML = `<div class="shell"><div class="topbar"><div><h1>PUBG Scoreboard</h1><p class="subtitle">กดคะแนนแล้วหน้า OBS และหน้าดูคะแนนจะอัปเดตทันที</p></div>${links('admin')}</div><div class="notice">ตอนนี้มี ${teams.length}/25 ทีม · ${db ? (signedInUser ? 'เชื่อมต่อ Supabase แล้ว' : 'ต้องล็อกอินก่อนแก้คะแนน') : 'ข้อมูลบันทึกในเบราว์เซอร์เครื่องนี้'}</div>${auth}<form class="editor" id="add-team"><input name="name" required maxlength="32" placeholder="ชื่อทีม เช่น NEXLABS"><input name="logo" placeholder="ลิงก์โลโก้ (ไม่บังคับ)"><input name="score" type="number" value="0" min="0" placeholder="คะแนนเริ่มต้น"><button class="button primary">+ เพิ่มทีม</button></form><div class="score-head score-grid"><span>อันดับ</span><span>ทีม</span><span>คะแนน</span><span></span></div><section>${rows || '<div class="empty">ยังไม่มีทีม — เพิ่มทีมแรกด้านบน</div>'}</section><div class="tools"><button id="undo" class="button">↶ ย้อนกลับ 1 ครั้ง</button><button id="reset" class="button danger">รีเซ็ตคะแนนทั้งหมด</button></div></div>`;
  document.querySelector('#login')?.addEventListener('click', loginAdmin);
  document.querySelector('#logout')?.addEventListener('click', async () => { await db.auth.signOut(); signedInUser=null; render(); });
  document.querySelectorAll('[data-change]').forEach(b => b.onclick = () => { if(!requireAdmin()) return; remember(); const t=teams.find(x=>x.id===b.dataset.id); t.score=Math.max(0,t.score+Number(b.dataset.change)); save(); });
  document.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => { if(!requireAdmin()) return; remember(); teams=teams.filter(t=>t.id!==b.dataset.remove); save(); });
  document.querySelector('#add-team').onsubmit = e => { e.preventDefault(); if(!requireAdmin()) return; if(teams.length>=25) return alert('เพิ่มได้สูงสุด 25 ทีม'); remember(); const f=new FormData(e.target); teams.push({id:crypto.randomUUID(),name:f.get('name').trim(),logo:f.get('logo').trim(),score:Number(f.get('score'))||0}); e.target.reset(); save(); };
  document.querySelector('#reset').onclick = () => { if(!requireAdmin()) return; if(confirm('รีเซ็ตคะแนนทุกทีมเป็น 0?')) { remember(); teams.forEach(t=>t.score=0); save(); } };
  document.querySelector('#undo').onclick = () => { const previous=history.pop(); if(previous) { teams=JSON.parse(previous); save(); } };
}
function overlay() { document.body.className='overlay-body'; const rows=sorted().slice(0,10).map((t,i)=>`<div class="overlay-row"><span class="overlay-rank">${i+1}</span>${logo(t)}<span class="team-title">${esc(t.name)}</span><span class="overlay-score">${t.score}</span></div>`).join(''); app.innerHTML=`<section class="overlay"><div class="overlay-title"><strong>PUBG ตารางคะแนน</strong><span>LIVE SCORE</span></div>${rows}</section>`; }
function live() { const rows=sorted().map((t,i)=>`<div class="team-row score-grid"><div class="rank">${i+1}</div><div class="team-name">${logo(t)}<span class="team-title">${esc(t.name)}</span></div><div class="score">${t.score}</div></div>`).join(''); document.body.className=''; app.innerHTML=`<div class="shell"><div class="topbar"><div><h1>คะแนนสด</h1><p class="subtitle">อัปเดตอัตโนมัติ</p></div>${links('live')}</div><section class="live-card"><div class="score-head score-grid"><span>อันดับ</span><span>ทีม</span><span>คะแนน</span></div>${rows}</section></div>`; }
function render() { const pathView = location.pathname.split('/').filter(Boolean).pop(); const view=new URLSearchParams(location.search).get('view') || pathView || 'admin'; ({admin,live,overlay}[view] || admin)(); }
channel && (channel.onmessage = e => { teams=e.data; render(); });
window.addEventListener('storage', e => { if(e.key===KEY) { teams=load(); render(); }});
if (db) { loadSupabase(); db.channel('teams-live').on('postgres_changes', {event:'*', schema:'public', table:'teams'}, loadSupabase).subscribe(); }
else { fetch('/api/state').then(r => r.ok ? r.json() : Promise.reject()).then(data => { if (Array.isArray(data) && data.length) { teams=data; render(); } }).catch(() => {}); try { const updates = new EventSource('/events'); updates.onmessage = e => { const next=JSON.parse(e.data); if (Array.isArray(next)) { teams=next; localStorage.setItem(KEY, JSON.stringify(teams)); render(); } }; } catch { /* opened directly from a file */ } }
render();
