const state = {
  settings:{siteName:'Telmo Partilhas',email:'telmo@example.com',instagram:'#',facebook:'#',location:'Portugal'},
  texts:{heroTitle:'O RALLYCROSS ATRAVÉS DA MINHA LENTE',heroSubtitle:'Fotografia de Rallycross, Motorsport e momentos que ficam para a história.',aboutTitle:'SOBRE O MEU TRABALHO',aboutText:'Telmo Partilhas acompanha provas, pilotos, equipas e eventos de Motorsport através da fotografia, procurando a velocidade, a emoção e os detalhes que tornam cada prova única.',contactText:'Para cobertura fotográfica, parcerias, media ou colaboração, entra em contacto.'},
  stats:{races:0,photos:0,events:0,partners:0},
  races:[],photos:[],partners:[],news:[],results:[]
};

let data = null, currentFilter='TODAS', calCursor = new Date(), galleryItems=[], galleryIndex=0, countdownTimer=null;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = x => String(x ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const fallbackImg='assets/hero-placeholder.svg';
const fmt = d => d ? new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(d+'T12:00:00')) : '—';
const statusPT={next:'PRÓXIMA',upcoming:'A SEGUIR',featured:'EM DESTAQUE',done:'REALIZADA'};

async function getSite(){
  try{
    const res=await fetch('/api/site',{cache:'no-store'});
    if(!res.ok) throw new Error('Não foi possível carregar o conteúdo do site.');
    const remote=await res.json();
    data=remote;
    return true;
  }catch(err){
    data=null;
    document.body.classList.add('offline');
    $('#loader').classList.add('hide');
    showToast('O site não conseguiu contactar a Cloudflare.');
    return false;
  }
}

document.addEventListener('DOMContentLoaded',async()=>{
  calCursor.setDate(1);
  const ok=await getSite();
  if(ok){renderAll();bindUI();setupReveal();setTimeout(()=>$('#loader').classList.add('hide'),350)}
});

function renderAll(){
  renderTexts(); renderStats(); renderNext(); renderCalendar(); renderGallery(); renderFeatured(); renderPartners(); renderNews(); renderResults(); bindSiteLinks();
}
function renderTexts(){
  $('#heroTitle').innerHTML=esc(data.texts.heroTitle).replace(/ ATRAVÉS DA MINHA LENTE$/,'<br><em> ATRAVÉS DA MINHA LENTE</em>');
  $('#heroSubtitle').textContent=data.texts.heroSubtitle;
  $('#aboutTitle').innerHTML=esc(data.texts.aboutTitle).replace(/TRABALHO$/,'<br><em>TRABALHO</em>');
  $('#aboutText').textContent=data.texts.aboutText;
  $('#contactText').textContent=data.texts.contactText;
}
function renderStats(){
  $('#statRaces').textContent=Number(data.stats?.races||data.races.length||0).toLocaleString('pt-PT');
  $('#statPhotos').textContent=Number(data.stats?.photos||data.photos.length||0).toLocaleString('pt-PT');
  $('#statEvents').textContent=Number(data.stats?.events||0).toLocaleString('pt-PT');
  $('#statPartners').textContent=Number(data.stats?.partners||data.partners.filter(x=>x.active).length||0).toLocaleString('pt-PT');
}
function nextRace(){
  const now=Date.now();
  return data.races.filter(r=>new Date((r.endDate||r.date)+'T23:59:59').getTime()>=now).sort((a,b)=>a.date.localeCompare(b.date))[0] || data.races.slice().sort((a,b)=>a.date.localeCompare(b.date))[0];
}
function dateRange(r){
  const a=new Date(r.date+'T12:00:00'), b=new Date((r.endDate||r.date)+'T12:00:00');
  const monthA=a.toLocaleString('pt-PT',{month:'long'}).toUpperCase();
  const monthB=b.toLocaleString('pt-PT',{month:'long'}).toUpperCase();
  if(a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth()) return `${String(a.getDate()).padStart(2,'0')} — ${String(b.getDate()).padStart(2,'0')} ${monthA} ${a.getFullYear()}`;
  return `${String(a.getDate()).padStart(2,'0')} ${monthA} — ${String(b.getDate()).padStart(2,'0')} ${monthB} ${b.getFullYear()}`;
}
function renderNext(){
  const r=nextRace(); if(!r) return;
  $('#nextBg').style.backgroundImage=`url("${r.image||fallbackImg}")`;
  $('#nextName').textContent=r.name; $('#nextDate').textContent=dateRange(r); $('#nextLocation').textContent=r.circuit||r.location||'Portugal'; $('#nextCategory').textContent=r.category||'—';
  $('#nextStatus').textContent=statusPT[r.status]||String(r.status||'PRÓXIMA').toUpperCase(); $('#nextDescription').textContent=r.description||'';
  if(countdownTimer) clearInterval(countdownTimer);
  const tick=()=>{const diff=Math.max(0,new Date(r.date+'T09:00:00')-new Date());const d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60,s=Math.floor(diff/1000)%60;[['#days',d],['#hours',h],['#minutes',m],['#seconds',s]].forEach(([sel,v])=>$(sel).textContent=String(v).padStart(2,'0'))};
  tick(); countdownTimer=setInterval(tick,1000);
}
function renderCalendar(){
  const year=calCursor.getFullYear(), month=calCursor.getMonth();
  $('#monthLabel').textContent=new Intl.DateTimeFormat('pt-PT',{month:'long',year:'numeric'}).format(new Date(year,month,1)).toUpperCase();
  const first=new Date(year,month,1), last=new Date(year,month+1,0), start=(first.getDay()+6)%7, cells=[];
  for(let i=start;i>0;i--){const d=new Date(year,month,1-i);cells.push({d,muted:true})}
  for(let i=1;i<=last.getDate();i++)cells.push({d:new Date(year,month,i),muted:false});
  while(cells.length%7)cells.push({d:new Date(year,month,last.getDate()+cells.length%7-start),muted:true});
  const map=new Map(data.races.map(r=>[r.date,r]));
  $('#calendarGrid').innerHTML=cells.map(({d,muted})=>{
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,r=map.get(key);
    return `<div class="day ${muted?'muted':''}"><span class="day-number">${d.getDate()}</span>${r?`<button class="day-event ${r.status==='featured'?'featured':''}" data-race="${r.id}">${esc(r.name)}</button>`:''}</div>`;
  }).join('');
  $$('#calendarGrid [data-race]').forEach(b=>b.onclick=()=>openRace(b.dataset.race));
  const visible=data.races.filter(r=>{const d=new Date(r.date+'T12:00:00');return d.getFullYear()===year&&d.getMonth()===month}).sort((a,b)=>a.date.localeCompare(b.date));
  $('#calendarList').innerHTML=visible.length?visible.map(r=>`<button class="race-item" data-race="${r.id}"><div class="race-day">${String(new Date(r.date+'T12:00:00').getDate()).padStart(2,'0')}<small>${new Date(r.date+'T12:00:00').toLocaleString('pt-PT',{month:'short'}).toUpperCase()}</small></div><div><h4>${esc(r.name)}</h4><p>${esc(r.location||'')} • ${esc(r.circuit||'')}</p></div><span class="race-state">${esc(statusPT[r.status]||'PRÓXIMA')}</span></button>`).join(''):'<div class="empty-state">Não existem provas neste mês.</div>';
  $$('#calendarList [data-race]').forEach(b=>b.onclick=()=>openRace(b.dataset.race));
}
function filteredPhotos(){
  const q=$('#search').value.toLowerCase().trim();
  return data.photos.filter(p=>(currentFilter==='TODAS'||p.category===currentFilter)&&(!q||[p.title,p.event,p.driver,p.location,p.category].join(' ').toLowerCase().includes(q))).sort((a,b)=>(a.order||0)-(b.order||0));
}
function renderGallery(){
  galleryItems=filteredPhotos();
  $('#galleryGrid').innerHTML=galleryItems.length?galleryItems.map((p,i)=>`<article class="photo" data-index="${i}"><img src="${esc(p.image||fallbackImg)}" alt="${esc(p.title)}" loading="lazy"><div class="photo-overlay"><small>${esc(p.category||'')} • ${esc(p.event||'')}</small><strong>${esc(p.title)}</strong></div></article>`).join(''):'<div class="empty-state">Não existem fotografias com estes filtros.</div>';
  $$('#galleryGrid .photo').forEach(el=>el.onclick=()=>openLightbox(Number(el.dataset.index)));
}
function renderFeatured(){
  const p=data.photos.find(x=>x.featured)||data.photos[0];
  if(!p){$('#featured').innerHTML='<div class="empty-state">A fotografia de destaque será escolhida no Admin.</div>';return}
  $('#featured').innerHTML=`<div class="feature-image" style="background-image:url('${esc(p.image||fallbackImg)}')"></div><div class="feature-copy"><span class="shot">FOTOGRAFIA DA SEMANA</span><h3>${esc(p.title)} <em>/</em> ${esc(p.event||'')}</h3><p>${esc(p.description||'')}</p><div class="feature-meta"><span>PROVA <b>${esc(p.event||'—')}</b></span><span>PILOTO / EQUIPA <b>${esc(p.driver||'—')}</b></span><span>LOCAL <b>${esc(p.location||'—')}</b></span><span>DATA <b>${fmt(p.date)}</b></span></div></div>`;
}
function renderPartners(){
  const list=data.partners.filter(p=>p.active).sort((a,b)=>(a.order||0)-(b.order||0));
  $('#partnersGrid').innerHTML=list.length?list.map(p=>`<article class="partner"><img src="${esc(p.logo||fallbackImg)}" alt="${esc(p.name)}"><h3>${esc(p.name)}</h3><p>${esc(p.description||'')}</p><span class="type">${esc(p.category||'PARCEIRO')}</span></article>`).join(''):'<div class="empty-state">Ainda não existem parceiros publicados.</div>';
}
function renderNews(){
  const list=data.news.filter(n=>n.published).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  $('#newsGrid').innerHTML=list.length?list.map(n=>`<article class="news-card"><img src="${esc(n.image||fallbackImg)}" alt="${esc(n.title)}" loading="lazy"><div class="news-copy"><small>${esc(n.category||'NOTÍCIAS')} • ${fmt(n.date)}</small><h3>${esc(n.title)}</h3><p>${esc(n.summary||'')}</p><button data-news="${n.id}">LER NOTÍCIA →</button></div></article>`).join(''):'<div class="empty-state">Ainda não existem notícias publicadas.</div>';
  $$('#newsGrid [data-news]').forEach(b=>b.onclick=()=>openNews(b.dataset.news));
}
function renderResults(){
  const cats=[...new Set(data.results.map(r=>r.category).filter(Boolean))];
  $('#resultFilter').innerHTML='<option value="TODAS">Todas as categorias</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  $('#resultsBody').innerHTML=data.results.length?data.results.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(r=>`<tr><td>${esc(r.race)}</td><td>${fmt(r.date)}</td><td>${esc(r.driver)}</td><td>${esc(r.category)}</td><td>${esc(r.position)}</td><td>${esc(r.time||'—')}</td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-state">Ainda não existem resultados publicados.</div></td></tr>';
  $('#resultFilter').onchange=()=>{
    const v=$('#resultFilter').value;
    $('#resultsBody').innerHTML=data.results.filter(r=>v==='TODAS'||r.category===v).sort((a,b)=>a.date.localeCompare(b.date)).map(r=>`<tr><td>${esc(r.race)}</td><td>${fmt(r.date)}</td><td>${esc(r.driver)}</td><td>${esc(r.category)}</td><td>${esc(r.position)}</td><td>${esc(r.time||'—')}</td></tr>`).join('');
  };
}
function bindSiteLinks(){
  const s=data.settings;
  $('#emailLink').textContent=s.email; $('#emailLink').href='mailto:'+s.email; $('#igLink').href=s.instagram||'#'; $('#fbLink').href=s.facebook||'#'; $('#footerIg').href=s.instagram||'#'; $('#footerFb').href=s.facebook||'#';
}
function openLightbox(i){
  galleryIndex=i; const p=galleryItems[i]; if(!p)return;
  $('#lbImage').src=p.image||fallbackImg; $('#lbTitle').textContent=p.title; $('#lbMeta').textContent=`${p.event||'—'} • ${p.driver||'—'} • ${fmt(p.date)} • ${p.location||'—'}`; $('#lbDescription').textContent=p.description||''; $('#lightbox').classList.add('open'); document.body.style.overflow='hidden';
}
function closeLightbox(){ $('#lightbox').classList.remove('open'); document.body.style.overflow='' }
function stepLightbox(dir){galleryIndex=(galleryIndex+dir+galleryItems.length)%galleryItems.length;openLightbox(galleryIndex)}
function openRace(id){
  const r=data.races.find(x=>x.id===id); if(!r)return;
  $('#raceContent').innerHTML=`<p class="eyebrow">${esc(statusPT[r.status]||'PROVA')}</p><h3>${esc(r.name)}</h3><div class="modal-meta"><div><small>DATA</small><b>${dateRange(r)}</b></div><div><small>LOCAL</small><b>${esc(r.location||'—')}</b></div><div><small>CIRCUITO</small><b>${esc(r.circuit||'—')}</b></div><div><small>CATEGORIA</small><b>${esc(r.category||'—')}</b></div></div><p>${esc(r.description||'')}</p>${r.result?`<p><strong>Resultado:</strong> ${esc(r.result)}</p>`:''}${r.link?`<p><a class="btn secondary" href="${esc(r.link)}" target="_blank" rel="noreferrer">Abrir página da prova ↗</a></p>`:''}`;
  $('#raceModal').classList.add('open');
}
function openNews(id){
  const n=data.news.find(x=>x.id===id); if(!n)return;
  $('#raceContent').innerHTML=`<p class="eyebrow">${esc(n.category||'NOTÍCIAS')} • ${fmt(n.date)}</p><h3>${esc(n.title)}</h3><p>${esc(n.content||n.summary||'')}</p>`;
  $('#raceModal').classList.add('open');
}
function bindUI(){
  $('#menu').onclick=()=>$('#nav').classList.toggle('open');
  $$('#nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));
  $('#prevMonth').onclick=()=>{calCursor.setMonth(calCursor.getMonth()-1);renderCalendar()};
  $('#nextMonth').onclick=()=>{calCursor.setMonth(calCursor.getMonth()+1);renderCalendar()};
  $('#monthLabel').onclick=()=>{calCursor=new Date();calCursor.setDate(1);renderCalendar()};
  $('#search').oninput=renderGallery;
  $$('#filters button').forEach(b=>b.onclick=()=>{$$('#filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;renderGallery()});
  $('#lbClose').onclick=closeLightbox; $('#lbPrev').onclick=()=>stepLightbox(-1); $('#lbNext').onclick=()=>stepLightbox(1);
  $('#lightbox').onclick=e=>{if(e.target.id==='lightbox')closeLightbox()};
  $('#raceClose').onclick=()=>$('#raceModal').classList.remove('open'); $('#raceModal').onclick=e=>{if(e.target.id==='raceModal')$('#raceModal').classList.remove('open')};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLightbox();$('#raceModal').classList.remove('open')}});
  $('#contactForm').onsubmit=async e=>{
    e.preventDefault(); const payload=Object.fromEntries(new FormData(e.currentTarget).entries()); const status=$('#formStatus'); status.textContent='A enviar...';
    try{const r=await fetch('/api/messages',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||'Não foi possível enviar.');status.textContent='Mensagem enviada com sucesso.';e.currentTarget.reset()}catch(err){status.textContent=err.message}
  };
}
function setupReveal(){const els=$$('.section,.stats,.photo,.race-item,.partner,.news-card,.feature-card');els.forEach(e=>e.classList.add('reveal'));const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)x.target.classList.add('show')}),{threshold:.08});els.forEach(e=>io.observe(e))}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
