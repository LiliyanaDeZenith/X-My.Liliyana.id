'use strict';
const NEXUS='https://nexus-sealyn-ai-deve-m9l5.bolt.host/';
const API=localStorage.api||(location.protocol==='file:'?'http://localhost:3000':'');
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const rid=()=>Math.random().toString(36).slice(2,9);
const P={home:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',bell:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',mail:'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',ai:'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z',user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',gear:'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',comment:'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',bookmark:'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',share:'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',image:'M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',trash:'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',back:'M19 12H5M12 19l-7-7 7-7',send:'M22 2L11 13M22 2l-7 20-4-9-9-4z',lock:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',coin:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v12M9 9h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5',star:'M12 2l3 7 7 .6-5.3 4.7L18.2 22 12 18.3 5.8 22l1.5-7.7L2 9.6 9 9z',eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24"><path d="${P[n]}"/></svg>`;
let S=JSON.parse(localStorage.ml||'null')||{me:{handle:'',name:'',bio:'',av:null,bn:null},posts:[],following:[],followers:[],notifs:[],chats:{},unread:{},theme:'dark',font:15,accent:'#1d9bf0',set:{},blocked:[],bm:[],reg:0,lang:'id'};
const save=()=>localStorage.ml=JSON.stringify(S);
const me=()=>S.me.handle;
const T=(a,b)=>S.lang==='en'?b:a,LOC=S.lang==='en'?'en-US':'id-ID';
let users={},G=[],online=false,draft=null,es,skew=0,tab='all';const GR={},NF={};
const now=()=>Date.now()+skew;
const ago=t=>{const s=(now()-t)/1e3;return s<60?T('baru saja','just now'):s<3600?(s/60|0)+'m':s<86400?(s/3600|0)+T('j','h'):new Date(t).toLocaleDateString(LOC,{day:'numeric',month:'short'})};
const mutual=()=>S.following.filter(h=>S.followers.includes(h));
const nm=h=>h===me()?S.me.name:(users[h]?.name||h);
/* ---------- penyimpanan media (IndexedDB, tahan refresh) ---------- */
const idb=new Promise(r=>{const q=indexedDB.open('ml',1);q.onupgradeneeded=()=>q.result.createObjectStore('b');q.onsuccess=()=>r(q.result)});
const tx=async(m,f)=>{const d=await idb;return new Promise(r=>{const q=f(d.transaction('b',m).objectStore('b'));q.onsuccess=()=>r(q.result)})};
const putB=async f=>{const id='b'+Date.now()+rid();await tx('readwrite',s=>s.put(f,id));return id};
const urls={};const bUrl=async id=>urls[id]||(urls[id]=URL.createObjectURL(await tx('readonly',s=>s.get(id))));
const hydrate=()=>$$('[data-b]:not([src])').forEach(async e=>{try{e.src=await bUrl(e.dataset.b);if(e.autoplay)e.play().catch(()=>{})}catch{}});
/* ---------- enkripsi end-to-end (ECDH P-256 + AES-GCM) ---------- */
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const EC={name:'ECDH',namedCurve:'P-256'};
async function keys(){if(S.k&&S.k.sp)return;S.k=S.k||{};if(!S.k.pub){const k=await crypto.subtle.generateKey(EC,true,['deriveKey']);S.k.priv=await crypto.subtle.exportKey('jwk',k.privateKey);S.k.pub=await crypto.subtle.exportKey('jwk',k.publicKey)}const g=await crypto.subtle.generateKey(SG,true,['sign']);S.k.sp=await crypto.subtle.exportKey('jwk',g.privateKey);S.k.spub=await crypto.subtle.exportKey('jwk',g.publicKey);save()}
async function shared(h){if(!users[h])await loadUsers();const pub=await crypto.subtle.importKey('jwk',users[h].pub,EC,false,[]),priv=await crypto.subtle.importKey('jwk',S.k.priv,EC,false,['deriveKey']);return crypto.subtle.deriveKey({name:'ECDH',public:pub},priv,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function enc(h,t){const iv=crypto.getRandomValues(new Uint8Array(12));return{iv:b64(iv),ct:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},await shared(h),new TextEncoder().encode(t)))}}
async function dec(h,d){return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(d.iv)},await shared(h),ub(d.ct)))}
/* ---------- server ---------- */
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const SG={name:'ECDSA',namedCurve:'P-256'};
const sign=async s=>b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},await crypto.subtle.importKey('jwk',S.k.sp,SG,false,['sign']),new TextEncoder().encode(s)));
const pub=p=>fetch(API+'/api/'+p).then(r=>r.json());
async function api(p,b={},h=me()){const t=now(),s=JSON.stringify(b);return(await fetch(API+'/api/'+p,{method:'POST',headers:{'Content-Type':'application/json','X-H':h,'X-T':String(t),'X-S':await sign(`${p}|${t}|${s}`)},body:s})).json()}
async function up(f){if(f.size>40e6){toast(T('File maksimal 40 MB','Max file size is 40 MB'));throw 0}const buf=await f.arrayBuffer(),t=now(),mt=f.type||'application/octet-stream',r=await fetch(API+'/api/upload',{method:'POST',headers:{'Content-Type':mt,'X-H':me(),'X-T':String(t),'X-S':await sign(`upload|${t}|${hex(await crypto.subtle.digest('SHA-256',buf))}|${mt}`)},body:buf}),j=await r.json();if(!j.id)throw 0;return j.id}
async function loadUsers(){try{(await pub('users')).forEach(u=>users[u.handle]=u);online=true;who()}catch{online=false}}
async function graph(){try{const g=await pub('graph?h='+me());S.following=g.following;S.followers=g.followers;save()}catch{}}
async function connect(){if(es)es.close();const t=now(),s=await sign(`stream|${t}|`);es=new EventSource(`${API}/api/stream?h=${me()}&t=${t}&s=${encodeURIComponent(s)}`);
 es.addEventListener('hist',e=>{G=JSON.parse(e.data);fillMsgs()});
 es.addEventListener('global',e=>{const m=JSON.parse(e.data);G.push(m);if(G.length>200)G.shift();if(curRoom()==='global')fillMsgs();else if(m.from!==me()){S.unread.global=(S.unread.global||0)+1;save();badges();toast(T('Chat global: ','Global chat: ')+m.name)}});
 es.addEventListener('msg',async e=>{const d=JSON.parse(e.data);if(S.blocked.includes(d.from))return;
  try{const t=await dec(d.from,d);let j;try{j=JSON.parse(t)}catch{j={x:t}}const o={o:0,x:String(j.x||''),t:d.t},m=j.m;
   if(m&&/^[a-f0-9]{24}$/.test(m.f)&&/^(image|video)\//.test(m.mt)){const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(m.iv)},await crypto.subtle.importKey('raw',ub(m.k),'AES-GCM',false,['decrypt']),await(await fetch(API+'/media/'+m.f)).arrayBuffer());o.m={t:m.mt.startsWith('video')?'video':'image',b:await putB(new Blob([raw],{type:m.mt}))}}
   ;(S.chats[d.from]=S.chats[d.from]||[]).push(o);
   if(curRoom()===d.from)fillMsgs();else{S.unread[d.from]=(S.unread[d.from]||0)+1;toast(T('Pesan baru dari ','New message from ')+nm(d.from))}save();badges()}catch(er){console.warn('gagal dekripsi',er)}});
 es.addEventListener('follow',async e=>{const d=JSON.parse(e.data);await loadUsers();if(d.on){if(!S.followers.includes(d.from)){S.followers.push(d.from);S.notifs.unshift({id:rid(),t:Date.now(),ty:'user',hr:'#/u/'+d.from,x:nm(d.from)+T(' mulai mengikuti Anda',' started following you')})}}else S.followers=S.followers.filter(x=>x!==d.from);save();badges();live();if(d.on)toast(nm(d.from)+T(' mengikuti Anda',' followed you'))});
 es.addEventListener('notif',async e=>{const d=JSON.parse(e.data);if(!users[d.from])await loadUsers();S.notifs.unshift({id:rid(),t:Date.now(),ty:d.ty==='like'?'heart':'comment',hr:'#/post/'+d.p,x:nm(d.from)+(d.ty==='like'?T(' menyukai postingan Anda',' liked your post'):T(' membalas postingan Anda',' replied to your post'))});save();badges();toast(S.notifs[0].x)});
 es.addEventListener('upd',async e=>{const d=JSON.parse(e.data);if(d.del)S.posts=S.posts.filter(p=>p.id!==d.del);else{if(!users[d.post.a])await loadUsers();upsert(d.post)}save();live()});
 es.addEventListener('user',e=>{const d=JSON.parse(e.data);if(d.gone)delete users[d.handle];else users[d.handle]=d;who();live()});
 es.onerror=()=>{online=false;es.close();setTimeout(connect,4000)};es.onopen=()=>online=true}
/* ---------- tema ---------- */
function applyTheme(){document.body.dataset.theme=S.theme;document.documentElement.style.setProperty('--ac',S.accent);document.documentElement.style.fontSize=S.font+'px';document.body.classList.toggle('rm',!!S.set['4.0.0'])}
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('s');clearTimeout(toast.i);toast.i=setTimeout(()=>e.classList.remove('s'),2600)};
/* ---------- komponen ---------- */
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0)*7,0)%360;
const mattr=m=>m.f?`src="${API}/media/${m.f}"`:`data-b="${m.b}"`;
const av=(h,big)=>{const u=h===me()?S.me:users[h],a=u&&u.av;return `<div class="av ${big?'big':''}" style="--h:${hue(h||'?')}">${a?`<img ${mattr(a)}>`:esc((h||'?')[0].toUpperCase())}</div>`};
const med=m=>!m?'':m.t==='video'?`<video class="md" ${mattr(m)} controls playsinline preload="metadata"></video>`:`<img class="md" ${mattr(m)}>`;
const find=(a,id)=>{for(const p of a){if(p.id===id)return p;const f=find(p.r||[],id);if(f)return f}};
const cnt=p=>(p.r||[]).reduce((a,r)=>a+1+cnt(r),0);
const parent=(a,id,par=null)=>{for(const p of a){if(p.id===id)return par?par.r:a;const f=parent(p.r||[],id,p);if(f)return f}};
const hdr=(t,back)=>`<div class="hd">${back?`<a class="gh" href="${back}">${ic('back')}</a>`:''}<h2>${t}</h2></div>`;
const card=(p,d=0,open=1)=>`<article class="post d${Math.min(d,3)}" data-id="${p.id}" ${open?'data-act="open"':''}>${av(p.a)}<div class="pc"><div class="ph"><b>${esc(nm(p.a))}</b><span>@${esc(p.a)} · ${ago(p.t)}</span>${p.a===me()?`<button class="gh" data-act="del">${ic('trash')}</button>`:''}</div>${p.x?`<p>${esc(p.x).replace(/(#\w+|@\w+)/g,'<em>$1</em>')}</p>`:''}${med(p.m)}<div class="acts"><button data-act="rep">${ic('comment')}<i>${cnt(p)||''}</i></button><button data-act="like" class="${p.l.includes(me())?'on':''}">${ic('heart')}<i>${p.l.length||''}</i></button><button data-act="bm" class="${S.bm.includes(p.id)?'on':''}">${ic('bookmark')}</button><button data-act="share">${ic('share')}</button></div></div></article>`;
const thread=(p,d)=>card(p,d,0)+(p.r||[]).map(r=>thread(r,d+1)).join('');
const composer=(t='')=>`<div class="cmp" data-t="${t}">${av(me())}<div class="cc"><textarea rows="2" placeholder="${t?'Tulis balasan':'Apa yang sedang terjadi?'}"></textarea><div class="prev"></div><div class="cb"><label class="gh">${ic('image')}<input type="file" hidden accept="image/*,video/*" data-act="pick"></label><button class="btn" data-act="send">${t?'Balas':'Posting'}</button></div></div></div>`;
const personRow=h=>`<div class="who">${av(h)}<div class="t"><b>${esc(nm(h))}</b><span>@${esc(h)}</span></div>${h===me()?'':`<button class="btn o ${S.following.includes(h)?'on':''}" data-act="follow" data-h="${h}">${S.following.includes(h)?'Mengikuti':'Ikuti'}</button>`}</div>`;
function who(){const q=($('#q')?.value||'').toLowerCase().replace('@','');const l=Object.keys(users).filter(h=>h!==me()&&(q?(h+nm(h)).toLowerCase().includes(q):!S.following.includes(h))).slice(0,6);$('#who').innerHTML=l.map(personRow).join('')||`<div class="fine">${online?'Belum ada orang lain.':'Server belum terhubung.'}</div>`}
function badges(){const n=S.notifs.filter(x=>!x.r).length,c=Object.values(S.unread).reduce((a,b)=>a+b,0);$$('.bn-notif').forEach(e=>{e.textContent=n;e.classList.toggle('s',n>0)});$$('.bn-chat').forEach(e=>{e.textContent=c;e.classList.toggle('s',c>0)})}
/* ---------- pengaturan ---------- */
const ST=[
['Akun Anda','user',[['Informasi akun','acc'],['Nonaktifkan akun','deact'],['Unduh arsip data Anda','dl']]],
['Keamanan dan akses akun','lock',[['Keamanan',['Autentikasi dua faktor (2FA)','Peringatan login baru','Minta kata sandi untuk tindakan sensitif']],['Akses akun',['Sesi aktif: hanya perangkat ini','Izinkan aplikasi terhubung']],['Passkey',['Aktifkan passkey di perangkat ini']]]],
['Privasi dan keamanan','eye',[['Audiens, media, dan penandaan',['Lindungi posting saya','Izinkan penandaan foto','Tandai media saya sebagai sensitif']],['Pesan Langsung',['Terima pesan dari semua orang','Tampilkan tanda sudah dibaca']],['Konten yang Anda lihat',['Tampilkan media sensitif','Personalisasi topik']],['Bisukan dan blokir','mute'],['Kemampuan ditemukan dan kontak',['Ditemukan lewat email','Ditemukan lewat nomor telepon']],['Berbagi data dan aktivitas di luar ML',['Personalisasi iklan','Bagikan data dengan mitra']],['Spaces',['Izinkan Spaces','Tampilkan Spaces teman']]]],
['Notifikasi','bell',[['Filter',['Hanya dari orang yang saya ikuti','Saring akun baru']],['Preferensi',['Notifikasi push','Email','SMS']],['Jenis notifikasi',['Pengikut baru','Pesan','Balasan','Suka']]]],
['Aksesibilitas, tampilan, dan bahasa','gear',[['Aksesibilitas',['Kurangi gerakan','Kontras tinggi']],['Tampilan','disp'],['Bahasa','lang']]],
['Monetisasi','coin',[['Bagi hasil kreator',['Ikut program bagi hasil']],['Langganan',['Izinkan pelanggan']],['Tips',['Terima tips','Tampilkan tombol tips']]]],
['Premium / ML Pro','star',[['Langganan Premium',['Centang verifikasi','Iklan lebih sedikit']],['Alat kreator',['Analitik posting','Jadwalkan posting']],['Folder markah, edit posting, posting panjang',['Folder markah','Edit posting (15 menit)','Posting panjang']]]],
['Tentang','info',[['Pusat Bantuan','info:Butuh bantuan? Kirim pesan ke akun resmi My Liliyana lewat menu Pesan.'],['Ketentuan Layanan','info:Gunakan My Liliyana dengan sopan. Dilarang spam, penipuan, dan konten yang membahayakan orang lain.'],['Kebijakan Privasi','info:Pesan pribadi dienkripsi di perangkat Anda dan server hanya meneruskan data terenkripsi. Postingan, profil, dan chat global bersifat publik.'],['Cookie','info:Aplikasi memakai penyimpanan lokal browser untuk tema, akun, dan media Anda.']]]];
function panel(s,i,it){const t=it[1];
 if(Array.isArray(t))return t.map((l,k)=>`<label class="tg"><span>${l}</span><input type="checkbox" data-k="${s}.${i}.${k}" ${S.set[`${s}.${i}.${k}`]?'checked':''}><b></b></label>`).join('');
 if(t==='acc')return `<label class="fl">Nama<input id="an" value="${esc(S.me.name)}" maxlength="30"></label><label class="fl">Username<input value="@${esc(me())}" disabled></label><label class="fl">Bio<textarea id="ab" rows="3" maxlength="160">${esc(S.me.bio||'')}</textarea></label><button class="btn" data-act="saveacc">Simpan perubahan</button>`;
 if(t==='deact')return `<p class="fl">Menonaktifkan akun menghapus profil dan postingan Anda dari server dan perangkat ini. Tindakan ini tidak bisa dibatalkan.</p><button class="btn" style="background:#f4212e" data-act="deact">Nonaktifkan akun</button>`;
 if(t==='dl')return `<p class="fl">Unduh salinan profil, postingan, pengikut, dan riwayat chat Anda dalam format JSON.</p><button class="btn" data-act="dl">Unduh arsip</button>`;
 if(t==='disp')return `<p>Latar belakang</p><div class="seg"><button class="btn o ${S.theme==='light'?'on':''}" data-act="theme" data-v="light">Putih</button><button class="btn o ${S.theme==='dark'?'on':''}" data-act="theme" data-v="dark">Hitam</button></div><p>Ukuran huruf</p><input type="range" min="13" max="20" value="${S.font}" data-act="font" style="width:100%;margin:10px 0"><p>Warna</p><div class="sw">${['#1d9bf0','#ffd400','#f91880','#7856ff','#ff7a00','#00ba7c'].map(c=>`<i data-act="acc" data-v="${c}" class="${S.accent===c?'on':''}" style="background:${c}"></i>`).join('')}</div>`;
 if(t==='lang')return `<select data-act="lang">${[['id','Bahasa Indonesia'],['en','English']].map(l=>`<option value="${l[0]}" ${S.lang===l[0]?'selected':''}>${l[1]}</option>`).join('')}</select>`;
 if(t==='mute')return `<label class="fl">Blokir pengguna<input id="bk" placeholder="@username"></label><button class="btn" data-act="block">Blokir</button><div style="margin-top:14px">${S.blocked.map(h=>`<div class="who"><div class="t"><b>@${esc(h)}</b></div><button class="btn o" data-act="unblock" data-h="${h}">Buka blokir</button></div>`).join('')||'<p class="fine">Belum ada akun yang diblokir.</p>'}</div>`;
 return `<p style="line-height:1.6">${esc(t.slice(5))}</p>`}
/* ---------- halaman ---------- */
const V={
home(){const f=S.posts.filter(p=>!S.blocked.includes(p.a)&&(tab==='all'||p.a===me()||S.following.includes(p.a)));return hdr('Beranda')+`<div class="tabs">${[['all','Untuk Anda'],['fol','Mengikuti']].map(t=>`<a data-act="tab" data-v="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</a>`).join('')}</div>`+composer()+(f.map(p=>card(p)).join('')||`<div class="empty">${tab==='all'&&!online?'Server belum terhubung.':'Belum ada postingan. Tulis yang pertama atau unggah foto dan video.'}</div>`)},
post(id){const p=find(S.posts,id);return hdr('Postingan','#/home')+(p?card(p,0,0)+composer(id)+(p.r||[]).map(r=>thread(r,1)).join(''):`<div class="empty">${NF[id]?'Postingan tidak ditemukan.':'Memuat…'}</div>`)},
notif(){return hdr('Notifikasi')+(S.notifs.map(n=>`<a class="nt ${n.r?'':'u'}" href="${esc(n.hr||'#/notif')}">${ic(n.ty)}<div><div>${esc(n.x)}</div><small class="fine" style="padding:0">${ago(n.t)}</small></div></a>`).join('')||'<div class="empty">Belum ada notifikasi. Pengikut baru akan muncul di sini.</div>')},
ai(){return hdr('Nexus AI')+`<iframe id="ai" allow="clipboard-write; microphone"></iframe>`},
profile(h){h=h||me();const mine=h===me(),u=mine?S.me:(users[h]||{name:h}),g=mine?{following:S.following,followers:S.followers}:(GR[h]||{following:[],followers:[]}),fr=g.following.filter(x=>g.followers.includes(x)).length,l=S.posts.filter(p=>p.a===h);
 return hdr(esc(u.name||h),'#/home')+`<div class="bn">${u.bn?(u.bn.t==='video'?`<video ${mattr(u.bn)} autoplay muted loop playsinline></video>`:`<img ${mattr(u.bn)}>`):''}</div><div class="pf"><div class="top">${mine?`<button class="btn o" data-act="editp">Edit profil</button>`:`<button class="btn o ${S.following.includes(h)?'on':''}" data-act="follow" data-h="${h}">${S.following.includes(h)?'Mengikuti':'Ikuti'}</button>${mutual().includes(h)?`<a class="btn" href="#/chat/${h}">Chat</a>`:''}`}</div>${av(h,1)}<h1 style="margin-top:8px">${esc(u.name||h)}</h1><div class="ph"><span>@${esc(h)}</span></div><p style="margin-top:8px;white-space:pre-wrap">${esc(u.bio||'')}</p><div class="st">${[['following','Mengikuti',g.following.length],['followers','Pengikut',g.followers.length],['friends','Teman',fr]].map(([k,n,v])=>mine?`<a href="#/people/${k}"><b>${v}</b> ${n}</a>`:`<span><b>${v}</b> ${n}</span>`).join('')}</div></div><div class="tabs"><a class="on">Postingan</a></div>`+(l.map(p=>card(p)).join('')||`<div class="empty">${mine?'Postingan Anda akan tampil di sini.':'Belum ada postingan.'}</div>`)},
u(h){return V.profile(h)},
people(k='following'){const l=k==='following'?S.following:k==='followers'?S.followers:mutual();return hdr(esc(S.me.name),'#/profile')+`<div class="tabs">${[['following','Mengikuti'],['followers','Pengikut'],['friends','Teman']].map(t=>`<a href="#/people/${t[0]}" class="${k===t[0]?'on':''}">${t[1]}</a>`).join('')}</div>`+(l.map(personRow).join('')||`<div class="empty">${k==='friends'?'Teman adalah orang yang saling mengikuti dengan Anda.':'Belum ada.'}</div>`)},
chat(a){const un=S.unread;
 if(a)return chatRoom(a);
 const t=`<div class="tabs"><a class="on" href="#/chat">Teman${(Object.entries(un).filter(([k])=>k!=='global').reduce((s,[,v])=>s+v,0))?' •':''}</a><a href="#/chat/global">Global${un.global?' ('+un.global+')':''}</a></div>`;
 return hdr('Pesan')+t+(online?'':'<div class="enc">Server chat belum terhubung. Jalankan node server.js</div>')+(mutual().map(h=>{const c=S.chats[h]||[],l=c[c.length-1];return `<a class="row" href="#/chat/${h}">${av(h)}<span><b>${esc(nm(h))}</b><small>${l?esc(l.x).slice(0,40):'Mulai percakapan'}</small></span>${un[h]?`<b class="bd s" style="position:static">${un[h]}</b>`:''}</a>`}).join('')||'<div class="empty">Saling ikuti dengan seseorang untuk mulai chat pribadi.</div>')},
settings(s,i){
 if(s===undefined)return hdr('Pengaturan')+ST.map((x,k)=>`<a class="row" href="#/settings/${k}">${ic(x[1])}<span>${x[0]}</span></a>`).join('');
 const sec=ST[s];if(i===undefined)return hdr(sec[0],'#/settings')+sec[2].map((it,k)=>`<a class="row" href="#/settings/${s}/${k}"><span>${it[0]}</span></a>`).join('');
 const it=sec[2][i];return hdr(it[0],'#/settings/'+s)+`<div class="pnl">${panel(+s,+i,it)}</div>`}};
const curRoom=()=>$('#msgs')?.dataset.k;
function chatRoom(k){const g=k==='global';return hdr(g?'Chat global':esc(nm(k)),'#/chat')+`<div class="enc">${g?'Terbuka untuk semua pengguna':T('Pesan terenkripsi end-to-end. Hanya Anda dan ','End-to-end encrypted. Only you and ')+esc(nm(k))+T(' yang bisa membacanya.',' can read them.')+`<small>${T('Kode keamanan: ','Security code: ')}<span id="fp">…</span></small>`}</div><div class="msgs" id="msgs" data-k="${k}"></div><form id="cf"><label class="gh">${ic('image')}<input type="file" hidden accept="image/*,video/*" data-act="cpick"></label><input id="ci" placeholder="Tulis pesan" autocomplete="off"><button class="btn">${ic('send')}</button></form>`}
function fillMsgs(){const el=$('#msgs');if(!el)return;const k=el.dataset.k,L=k==='global'?G.map(g=>({o:g.from===me(),x:g.text,t:g.t,n:g.name,m:g.m})):(S.chats[k]||[]);el.innerHTML=L.map(m=>`<div class="bub ${m.o?'o':''}">${!m.o&&k==='global'?`<small>${esc(m.n)}</small>`:''}${med(m.m)}${esc(m.x)}<time>${new Date(m.t).toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit'})}</time></div>`).join('');hydrate();const dn=()=>el.scrollTop=el.scrollHeight;dn();$$('img,video',el).forEach(i=>{i.onload=i.onloadeddata=dn});if(S.unread[k]){S.unread[k]=0;save();badges()}}
async function fp(h){if(!users[h])await loadUsers();if(!users[h])return;const j=k=>k.x+k.y,d=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode([S.k.pub,users[h].pub].map(j).sort().join(''))));const e=$('#fp');if(e)e.textContent=d.slice(0,30).replace(/(.{5})(?=.)/g,'$1 ')}
const upsert=p=>{const i=S.posts.findIndex(x=>x.id===p.id);if(i<0)S.posts.push(p);else S.posts[i]=p;S.posts.sort((a,b)=>b.t-a.t);S.posts.length=Math.min(S.posts.length,300)};
async function sync(){const[f]=await Promise.all([pub('feed'),loadUsers()]);const min=f.length<100?0:f[f.length-1].t;S.posts=S.posts.filter(p=>p.t<min||f.some(x=>x.id===p.id));f.forEach(upsert);save()}
async function pull(h){const[f,g]=await Promise.all([pub('feed?by='+h),pub('graph?h='+h),loadUsers()]);f.forEach(upsert);GR[h]=g;save()}
async function one(id){const f=await pub('feed?id='+id);f.forEach(upsert);if(!f.length){NF[id]=1;S.posts=S.posts.filter(p=>p.id!==id)}save()}
const busy=()=>document.activeElement?.matches('input,textarea,select')||$$('video').some(v=>!v.paused)||$('#modal.s');
function live(){const pg=location.hash.split('/')[1]||'home';if(!['ai','settings'].includes(pg)&&!busy())route(1,1)}
const jobs={home:()=>sync(),post:a=>one(a),profile:()=>pull(me()),u:a=>pull(a)};
function route(keep,np){const lh=location.hash,[,pg='home',a,b]=lh.split('/'),f=V[pg]||V.home;$('#main').innerHTML=`<section class="pg">${f(a,b)}</section>`;const act=({post:'home',u:'profile',people:'profile'})[pg]||pg||'home';$$('#nav a,#bnav a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')==='#/'+act));hydrate();fillMsgs();if(pg==='ai')$('#ai').src=NEXUS;if(pg==='notif'){S.notifs.forEach(n=>n.r=1);save();badges()}if(pg==='chat'&&a&&a!=='global')fp(a);if(!keep)scrollTo(0,0);who();
 if(!np&&jobs[pg])jobs[pg](a).then(()=>{if(location.hash===lh&&!busy())route(1,1)}).catch(()=>{})}
/* ---------- modal ---------- */
const modal=(h,close=true)=>{const m=$('#modal');m.innerHTML=`<div class="mb">${h}</div>`;m.classList.add('s');m.dataset.c=close?1:''};
const closeM=()=>{$('#modal').classList.remove('s');draft=null};
function editProfile(){modal(`<h2>Edit profil</h2><label class="fl">Banner (foto atau video)<input type="file" accept="video/*,image/*" data-act="pickbn"></label><label class="fl">Foto profil<input type="file" accept="image/*" data-act="pickav"></label><label class="fl">Nama<input id="en" value="${esc(S.me.name)}" maxlength="30"></label><label class="fl">Bio<textarea id="eb" rows="3" maxlength="160">${esc(S.me.bio||'')}</textarea></label><button class="btn" data-act="savep">Simpan</button>`)}
const files={};
async function onboard(){return new Promise(res=>{modal(`<h2>Selamat datang di My Liliyana</h2><label class="fl">Nama<input id="rn" maxlength="30" placeholder="Nama tampilan"></label><label class="fl">Username (huruf kecil, angka, _)<input id="rh" maxlength="15" placeholder="contoh: liliyana"></label><p id="re" class="fine" style="color:#f4212e;padding:0 0 10px"></p><button class="btn" id="rg">Buat akun</button>`,false);
 $('#rg').onclick=async()=>{const h=$('#rh').value.trim().toLowerCase(),n=$('#rn').value.trim();if(!n||!/^[a-z0-9_]{3,15}$/.test(h))return $('#re').textContent='Isi nama dan username 3–15 karakter (a-z, 0-9, _).';
  try{const r=await api('register',{handle:h,name:n,pub:S.k.pub,spub:S.k.spub},h);if(r.error)return $('#re').textContent='Username sudah dipakai orang lain.'}catch{}
  S.me.handle=h;S.me.name=n;S.reg=1;save();closeM();res()}})}
/* ---------- aksi ---------- */
async function doSend(cmp,btn){const x=$('textarea',cmp).value.trim(),re=cmp.dataset.t;if(!x&&!draft)return;btn.disabled=true;
 try{let m=null;if(draft)m={t:draft.type.startsWith('video')?'video':'image',f:await up(draft)};const r=await api('post',{x,m,re:re||null});if(r.error)throw 0;upsert(r.post);draft=null;save();closeM();route(1,1)}
 catch{toast(T('Gagal mengirim. Cek server.','Failed to send. Check the server.'));btn.disabled=false}}
async function chatMedia(file,x){const k=curRoom();if(!/^(image|video)\//.test(file.type))return toast(T('Pilih foto atau video','Choose a photo or video'));toast(T('Mengirim…','Sending…'));
 try{const t=file.type.startsWith('video')?'video':'image';
  if(k==='global'){const r=await api('global',{text:x,m:{t,f:await up(file)}});if(r.error)throw 0}
  else{const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12)),f=await up(new Blob([await crypto.subtle.encrypt({name:'AES-GCM',iv},key,await file.arrayBuffer())])),c=await enc(k,JSON.stringify({x,m:{f,k:b64(await crypto.subtle.exportKey('raw',key)),iv:b64(iv),mt:file.type}})),r=await api('send',{to:k,...c});if(r.error)throw 0;
   (S.chats[k]=S.chats[k]||[]).push({o:1,x,t:Date.now(),m:{t,b:await putB(file)}});save();fillMsgs()}}
 catch{toast(T('Gagal mengirim media','Failed to send media'))}}
async function follow(h){const on=!S.following.includes(h);S.following=on?[...S.following,h]:S.following.filter(x=>x!==h);save();try{await api('follow',{from:me(),to:h,on})}catch{toast('Server belum terhubung')}route()}
document.addEventListener('click',async e=>{
 if(e.target.id==='modal'&&$('#modal').dataset.c)return closeM();
 const b=e.target.closest('[data-act]');if(!b||b.tagName==='INPUT')return;const a=b.dataset.act,art=b.closest('[data-id]'),id=art?.dataset.id;
 if(a==='open'){if(!e.target.closest('video'))location.hash='#/post/'+id;return}
 e.stopPropagation();
 if(a==='like'){const p=find(S.posts,id),i=p.l.indexOf(me());i<0?p.l.push(me()):p.l.splice(i,1);save();b.classList.toggle('on');$('i',b).textContent=p.l.length||'';api('like',{id}).catch(()=>{})}
 else if(a==='bm'){S.bm=S.bm.includes(id)?S.bm.filter(x=>x!==id):[...S.bm,id];save();b.classList.toggle('on')}
 else if(a==='share'){const u=location.href.split('#')[0]+'#/post/'+id;navigator.clipboard?.writeText(u);toast('Tautan disalin')}
 else if(a==='del'){const l=parent(S.posts,id);l.splice(l.findIndex(p=>p.id===id),1);save();route(1,1);api('delete',{id}).catch(()=>{})}
 else if(a==='rep'){modal(card(find(S.posts,id),0,0)+composer(id));$('#modal textarea').focus()}
 else if(a==='send')doSend(b.closest('.cmp'),b)
 else if(a==='unpick'){draft=null;$('.prev',b.closest('.cmp')).innerHTML=''}
 else if(a==='tab'){tab=b.dataset.v;route(1,1)}
 else if(a==='follow')follow(b.dataset.h)
 else if(a==='editp')editProfile()
 else if(a==='savep'){b.disabled=true;try{const pr={name:$('#en').value.trim()||S.me.name,bio:$('#eb').value};if(files.av)pr.av={f:await up(files.av)};if(files.bn)pr.bn={t:files.bn.type.startsWith('video')?'video':'image',f:await up(files.bn)};const r=await api('profile',pr);if(r.error)throw 0;Object.assign(S.me,{name:r.u.name,bio:r.u.bio,av:r.u.av||S.me.av,bn:r.u.bn||S.me.bn});users[me()]=r.u;for(const k in files)delete files[k];save();closeM();route(1,1);meBox()}catch{toast(T('Gagal menyimpan. Cek server.','Failed to save. Check the server.'));b.disabled=false}}
 else if(a==='saveacc'){S.me.name=$('#an').value.trim()||S.me.name;S.me.bio=$('#ab').value;save();api('profile',{name:S.me.name,bio:S.me.bio}).catch(()=>{});meBox();toast('Perubahan disimpan')}
 else if(a==='theme'){S.theme=b.dataset.v;save();applyTheme();route()}
 else if(a==='acc'){S.accent=b.dataset.v;save();applyTheme();route()}
 else if(a==='block'){const h=$('#bk').value.trim().replace('@','').toLowerCase();if(h&&h!==me()){S.blocked.push(h);S.following=S.following.filter(x=>x!==h);save();route()}}
 else if(a==='unblock'){S.blocked=S.blocked.filter(x=>x!==b.dataset.h);save();route()}
 else if(a==='dl'){const d={...S};delete d.k;const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));l.download='arsip-my-liliyana.json';l.click()}
 else if(a==='deact'){if(confirm(T('Yakin menonaktifkan akun? Semua data dihapus.','Deactivate your account? All data will be deleted.'))){await api('deact',{}).catch(()=>{});localStorage.clear();indexedDB.deleteDatabase('ml');location.hash='';location.reload()}}
 else if(a==='tm'){S.theme=S.theme==='dark'?'light':'dark';save();applyTheme()}
});
document.addEventListener('change',e=>{const t=e.target,a=t.dataset.act;
 if(t.dataset.k){S.set[t.dataset.k]=t.checked;save();applyTheme()}
 else if(a==='lang'){S.lang=t.value;save();location.reload()}
 else if(a==='pick'&&t.files[0]){draft=t.files[0];const c=t.closest('.cmp'),u=URL.createObjectURL(draft);$('.prev',c).innerHTML=`<div class="pv">${draft.type.startsWith('video')?`<video class="md" src="${u}" controls></video>`:`<img class="md" src="${u}">`}<button data-act="unpick">×</button></div>`}
 else if(a==='pickav')files.av=t.files[0];else if(a==='pickbn')files.bn=t.files[0];else if(a==='cpick'&&t.files[0]){chatMedia(t.files[0],$('#ci').value.trim());t.value='';$('#ci').value=''}});
document.addEventListener('input',e=>{if(e.target.dataset.act==='font'){S.font=+e.target.value;save();applyTheme()}if(e.target.id==='q')who()});
document.addEventListener('submit',async e=>{if(e.target.id!=='cf')return;e.preventDefault();const i=$('#ci'),x=i.value.trim(),k=curRoom();if(!x)return;i.value='';
 try{if(k==='global'){const r=await api('global',{text:x});if(r.error)throw 0}else{const c=await enc(k,JSON.stringify({x})),r=await api('send',{to:k,...c});if(r.error)throw 0;(S.chats[k]=S.chats[k]||[]).push({o:1,x,t:Date.now()});save();fillMsgs()}}catch{toast(T('Pesan gagal terkirim. Cek server.','Message failed to send. Check the server.'))}});
$('#pb').onclick=()=>{modal(composer());$('#modal textarea').focus()};
function meBox(){$('#meBox').innerHTML=`${av(me())}<div class="t"><b>${esc(S.me.name)}</b><span>@${esc(me())}</span></div><button class="tm" data-act="tm" title="Ganti tema">◐</button>`}
const NAV=[['home','home','Beranda'],['notif','bell','Notifikasi'],['chat','mail','Pesan'],['ai','ai','Nexus AI'],['profile','user','Profil'],['settings','gear','Pengaturan']];
const navHtml=()=>NAV.map(n=>`<a href="#/${n[0]}">${ic(n[1])}<span>${n[2]}</span>${n[0]==='notif'||n[0]==='chat'?`<b class="bd bn-${n[0]}"></b>`:''}</a>`).join('');
const EN=Object.fromEntries(`Posting|Post
Cari orang|Search people
Orang di My Liliyana|People on My Liliyana
My Liliyana (ML) · Pesan pribadi terenkripsi end-to-end|My Liliyana (ML) · Private messages are end-to-end encrypted
Beranda|Home
Notifikasi|Notifications
Pesan|Messages
Profil|Profile
Pengaturan|Settings
Ganti tema|Switch theme
Untuk Anda|For you
Mengikuti|Following
Ikuti|Follow
Server belum terhubung.|Server not connected.
Server belum terhubung|Server not connected
Belum ada postingan. Tulis yang pertama atau unggah foto dan video.|No posts yet. Write the first one or upload a photo or video.
Postingan|Posts
Memuat…|Loading…
Postingan tidak ditemukan.|Post not found.
Apa yang sedang terjadi?|What is happening?
Tulis balasan|Write a reply
Balas|Reply
Belum ada notifikasi. Pengikut baru akan muncul di sini.|No notifications yet. New followers will show up here.
Edit profil|Edit profile
Pengikut|Followers
Teman|Friends
Teman •|Friends •
Postingan Anda akan tampil di sini.|Your posts will show up here.
Belum ada postingan.|No posts yet.
Teman adalah orang yang saling mengikuti dengan Anda.|Friends are people who follow each other.
Belum ada.|Nothing yet.
Belum ada orang lain.|No other people yet.
Server chat belum terhubung. Jalankan node server.js|Chat server not connected. Run node server.js
Mulai percakapan|Start a conversation
Saling ikuti dengan seseorang untuk mulai chat pribadi.|Follow each other to start a private chat.
Chat global|Global chat
Terbuka untuk semua pengguna|Open to all users
Tulis pesan|Write a message
Banner (foto atau video)|Banner (photo or video)
Foto profil|Profile photo
Nama|Name
Simpan|Save
Selamat datang di My Liliyana|Welcome to My Liliyana
Username (huruf kecil, angka, _)|Username (lowercase letters, numbers, _)
Buat akun|Create account
Nama tampilan|Display name
contoh: liliyana|e.g. liliyana
Isi nama dan username 3–15 karakter (a-z, 0-9, _).|Enter a name and a username of 3–15 characters (a-z, 0-9, _).
Username sudah dipakai orang lain.|That username is already taken.
Tautan disalin|Link copied
Perubahan disimpan|Changes saved
Akun Anda|Your account
Keamanan dan akses akun|Security and account access
Privasi dan keamanan|Privacy and safety
Aksesibilitas, tampilan, dan bahasa|Accessibility, display, and languages
Monetisasi|Monetization
Tentang|About
Informasi akun|Account information
Nonaktifkan akun|Deactivate account
Unduh arsip data Anda|Download an archive of your data
Keamanan|Security
Akses akun|Account access
Audiens, media, dan penandaan|Audience, media and tagging
Pesan Langsung|Direct Messages
Konten yang Anda lihat|Content you see
Bisukan dan blokir|Mute and block
Kemampuan ditemukan dan kontak|Discoverability and contacts
Berbagi data dan aktivitas di luar ML|Data sharing and off-ML activity
Filter|Filters
Preferensi|Preferences
Jenis notifikasi|Notification types
Aksesibilitas|Accessibility
Tampilan|Display
Bahasa|Languages
Bagi hasil kreator|Creator revenue sharing
Langganan|Subscriptions
Langganan Premium|Premium subscription
Alat kreator|Creator tools
Folder markah, edit posting, posting panjang|Bookmark folders, edit post, longer posts
Pusat Bantuan|Help Center
Ketentuan Layanan|Terms of Service
Kebijakan Privasi|Privacy Policy
Autentikasi dua faktor (2FA)|Two-factor authentication (2FA)
Peringatan login baru|New login alerts
Minta kata sandi untuk tindakan sensitif|Ask for password on sensitive actions
Sesi aktif: hanya perangkat ini|Active sessions: this device only
Izinkan aplikasi terhubung|Allow connected apps
Aktifkan passkey di perangkat ini|Enable passkey on this device
Lindungi posting saya|Protect my posts
Izinkan penandaan foto|Allow photo tagging
Tandai media saya sebagai sensitif|Mark my media as sensitive
Terima pesan dari semua orang|Receive messages from everyone
Tampilkan tanda sudah dibaca|Show read receipts
Tampilkan media sensitif|Show sensitive media
Personalisasi topik|Personalize topics
Ditemukan lewat email|Discoverable by email
Ditemukan lewat nomor telepon|Discoverable by phone number
Personalisasi iklan|Personalize ads
Bagikan data dengan mitra|Share data with partners
Izinkan Spaces|Allow Spaces
Tampilkan Spaces teman|Show friends' Spaces
Hanya dari orang yang saya ikuti|Only from people I follow
Saring akun baru|Filter new accounts
Notifikasi push|Push notifications
Pengikut baru|New followers
Balasan|Replies
Suka|Likes
Kurangi gerakan|Reduce motion
Kontras tinggi|High contrast
Ikut program bagi hasil|Join revenue sharing program
Izinkan pelanggan|Allow subscribers
Terima tips|Accept tips
Tampilkan tombol tips|Show tip button
Centang verifikasi|Verification badge
Iklan lebih sedikit|Fewer ads
Analitik posting|Post analytics
Jadwalkan posting|Schedule posts
Folder markah|Bookmark folders
Edit posting (15 menit)|Edit post (15 minutes)
Posting panjang|Longer posts
Simpan perubahan|Save changes
Menonaktifkan akun menghapus profil dan postingan Anda dari server dan perangkat ini. Tindakan ini tidak bisa dibatalkan.|Deactivating deletes your profile and posts from the server and this device. This cannot be undone.
Unduh salinan profil, postingan, pengikut, dan riwayat chat Anda dalam format JSON.|Download a copy of your profile, posts, followers, and chat history as JSON.
Unduh arsip|Download archive
Latar belakang|Background
Putih|White
Hitam|Black
Ukuran huruf|Font size
Warna|Color
Blokir pengguna|Block user
Blokir|Block
Buka blokir|Unblock
Belum ada akun yang diblokir.|No blocked accounts yet.
Butuh bantuan? Kirim pesan ke akun resmi My Liliyana lewat menu Pesan.|Need help? Message the official My Liliyana account from the Messages menu.
Gunakan My Liliyana dengan sopan. Dilarang spam, penipuan, dan konten yang membahayakan orang lain.|Use My Liliyana respectfully. Spam, scams, and content that harms others are not allowed.
Pesan pribadi dienkripsi di perangkat Anda dan server hanya meneruskan data terenkripsi. Postingan, profil, dan chat global bersifat publik.|Private messages are encrypted on your device and the server only relays encrypted data. Posts, profiles, and global chat are public.
Aplikasi memakai penyimpanan lokal browser untuk tema, akun, dan media Anda.|The app uses your browser's local storage for your theme, account, and media.`.split('\n').map(l=>l.split('|')));
const has=k=>Object.hasOwn(EN,k);
function tr(n){if(S.lang!=='en'||!n)return;const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let x;while(x=w.nextNode()){const k=x.nodeValue.trim();if(has(k))x.nodeValue=x.nodeValue.replace(k,EN[k])}if(n.querySelectorAll)for(const e of[n,...n.querySelectorAll('[placeholder],[title]')])for(const a of['placeholder','title']){const v=e.getAttribute&&e.getAttribute(a);if(v&&has(v))e.setAttribute(a,EN[v])}}
new MutationObserver(m=>m.forEach(r=>r.addedNodes.forEach(n=>tr(n.nodeType===1?n:n.parentNode)))).observe(document.body,{childList:true,subtree:true});
(async()=>{if(typeof S.me.av==='string')S.me.av={b:S.me.av};document.documentElement.lang=S.lang;applyTheme();$('#nav').innerHTML=navHtml();$('#bnav').innerHTML=navHtml();await keys();
 try{skew=(await pub('time')).t-Date.now()}catch{}
 if(!S.reg)await onboard();meBox();tr(document.body);
 await loadUsers();
 if(online){const r=await api('register',{handle:me(),name:S.me.name,pub:S.k.pub,spub:S.k.spub}).catch(()=>({}));
  if(r.error==='taken'){S.reg=0;save();return location.reload()}
  if(r.u){const u=r.u;S.me.name=u.name;S.me.bio=u.bio||'';if(u.av)S.me.av=u.av;if(u.bn)S.me.bn=u.bn;users[me()]=u;save();meBox()}
  await graph();connect();setInterval(loadUsers,15000)}
 badges();addEventListener('hashchange',()=>route());route()})();
