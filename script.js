const STORE_KEY='telmo_partilhas_data_v1';
const defaults={
  settings:{siteName:'Telmo Partilhas',logo:'assets/logo.png',email:'telmo@example.com',instagram:'#',facebook:'#',location:'Portugal',password:'admin123'},
  texts:{heroTitle:'O RALLYCROSS ATRAVÉS DA MINHA LENTE',heroSubtitle:'Fotografia de Rallycross, Motorsport e momentos que ficam para a história.',aboutTitle:'SOBRE O MEU TRABALHO',aboutText:'Telmo Partilhas acompanha provas, pilotos, equipas e eventos de Motorsport através da fotografia, procurando a velocidade, a emoção e os detalhes que tornam cada prova única.',contactText:'Para cobertura fotográfica, parcerias, media ou colaboração, entra em contacto.'},
  stats:{races:0,photos:0,events:0,partners:0},
  races:[
    {id:'r1',name:'RALLYCROSS PORTUGAL',date:'2027-06-20',endDate:'2027-06-21',location:'Montalegre',circuit:'Circuito de Montalegre',country:'Portugal',category:'SuperCars',status:'next',image:'assets/placeholder-rally.svg',description:'Fim de semana de Rallycross em Montalegre.',link:'',result:''},
    {id:'r2',name:'MOTORSPORT FEST',date:'2027-07-11',endDate:'2027-07-11',location:'Lousada',circuit:'Circuito de Lousada',country:'Portugal',category:'Touring',status:'featured',image:'assets/placeholder-rally.svg',description:'Festival de Motorsport e ação em pista.',link:'',result:''},
    {id:'r3',name:'RALLYCROSS IBÉRICO',date:'2027-08-08',endDate:'2027-08-08',location:'Fafe',circuit:'Circuito de Fafe',country:'Portugal',category:'Super1600',status:'upcoming',image:'assets/placeholder-rally.svg',description:'Etapa do calendário ibérico.',link:'',result:''}
  ],
  photos:[
    {id:'p1',title:'Ataque na curva',category:'Rallycross',event:'Rallycross Portugal',driver:'Piloto / Equipa',date:'2027-06-20',location:'Montalegre',description:'Imagem de exemplo — substitui no Admin pela tua fotografia.',image:'assets/placeholder-rally.svg',featured:true,order:1},
    {id:'p2',title:'Linha de meta',category:'Motorsport',event:'Motorsport Fest',driver:'Piloto / Equipa',date:'2027-07-11',location:'Lousada',description:'Imagem de exemplo.',image:'assets/placeholder-rally.svg',featured:false,order:2},
    {id:'p3',title:'Paddock',category:'Eventos',event:'Motorsport Fest',driver:'Equipas',date:'2027-07-11',location:'Lousada',description:'Imagem de exemplo.',image:'assets/placeholder-rally.svg',featured:false,order:3},
    {id:'p4',title:'Concentração',category:'Pilotos',event:'Rallycross Ibérico',driver:'Piloto',date:'2027-08-08',location:'Fafe',description:'Imagem de exemplo.',image:'assets/placeholder-rally.svg',featured:false,order:4},
    {id:'p5',title:'Saída da grelha',category:'Rallycross',event:'Rallycross Portugal',driver:'Piloto',date:'2027-06-20',location:'Montalegre',description:'Imagem de exemplo.',image:'assets/placeholder-rally.svg',featured:false,order:5},
    {id:'p6',title:'Detalhe máquina',category:'Motorsport',event:'Rallycross Portugal',driver:'Equipa',date:'2027-06-21',location:'Montalegre',description:'Imagem de exemplo.',image:'assets/placeholder-rally.svg',featured:false,order:6}
  ],
  partners:[
    {id:'pa1',name:'Parceiro Principal',logo:'assets/logo.png',description:'Espaço reservado para o teu main partner.',website:'#',instagram:'#',facebook:'#',category:'MAIN PARTNER',order:1,active:true},
    {id:'pa2',name:'Official Partner',logo:'assets/logo.png',description:'Espaço reservado para parceiro oficial.',website:'#',instagram:'#',facebook:'#',category:'OFFICIAL PARTNER',order:2,active:true},
    {id:'pa3',name:'Supporter',logo:'assets/logo.png',description:'Espaço reservado para supporter.',website:'#',instagram:'#',facebook:'#',category:'SUPPORTER',order:3,active:true}
  ],
  news:[
    {id:'n1',title:'Novo capítulo em Montalegre',summary:'Exemplo de notícia para substituíres pelo teu conteúdo real.',content:'Aqui podes escrever o conteúdo completo da notícia. O editor do Admin permite alterar tudo sem mexer no HTML.',date:'2027-06-18',category:'Rallycross',image:'assets/placeholder-rally.svg',published:true},
    {id:'n2',title:'Portfólio atualizado',summary:'As novas fotografias entram diretamente pelo painel de administração.',content:'Adiciona fotografias, categorias, eventos e descrições através do Admin.',date:'2027-05-20',category:'Fotografia',image:'assets/placeholder-rally.svg',published:true},
    {id:'n3',title:'Parcerias 2027',summary:'Espaço editorial para novidades sobre patrocinadores e parceiros.',content:'Apresenta os parceiros e conta a história do projeto.',date:'2027-05-05',category:'Parceiros',image:'assets/placeholder-rally.svg',published:true}
  ],
  results:[
    {id:'res1',race:'RALLYCROSS PORTUGAL',date:'2027-06-20',driver:'Piloto de Exemplo',category:'SuperCars',position:'1',time:'—',notes:'Resultado de exemplo.'},
    {id:'res2',race:'RALLYCROSS PORTUGAL',date:'2027-06-20',driver:'Piloto de Exemplo',category:'SuperCars',position:'2',time:'—',notes:'Resultado de exemplo.'}
  ],
  messages:[]
};
function clone(v){return JSON.parse(JSON.stringify(v))}
function loadData(){try{const raw=localStorage.getItem(STORE_KEY);if(raw){return {...clone(defaults),...JSON.parse(raw)}}}catch(e){} return clone(defaults)}
let data=loadData();
function saveData(){localStorage.setItem(STORE_KEY,JSON.stringify(data))}
const fmtDate=d=>new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(d+'T12:00:00'));
const fmtLong=d=>new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(d+'T12:00:00'));
function normalizeImage(src){return src||'assets/placeholder-rally.svg'}
function qs(s){return document.querySelector(s)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

document.addEventListener('DOMContentLoaded',()=>{
  applyTexts(); renderStats(); renderNextRace(); renderCalendar(); renderGallery(); renderFeatured(); renderPartners(); renderNews(); renderResults(); bindUI();
  setTimeout(()=>qs('#site-loader')?.classList.add('hide'),400);
  setupReveal();
});
function applyTexts(){
  qs('#heroTitle').innerHTML=esc(data.texts.heroTitle).replace(' ATRAVÉS DA MINHA LENTE','<br><em> ATRAVÉS DA MINHA LENTE</em>');
  qs('#heroSubtitle').textContent=data.texts.heroSubtitle; qs('#aboutTitle').textContent=data.texts.aboutTitle; qs('#aboutText').textContent=data.texts.aboutText; qs('#contactText').textContent=data.texts.contactText;
  const s=data.settings; qs('#contactEmail').textContent=s.email; qs('#contactEmail').href='mailto:'+s.email; qs('#contactInstagram').href=s.instagram||'#'; qs('#contactFacebook').href=s.facebook||'#'; qs('#contactLocation').textContent=s.location||'Portugal'; qs('#footerInstagram').href=s.instagram||'#'; qs('#footerFacebook').href=s.facebook||'#';
}
function renderStats(){[['races','races'],['photos','photos'],['events','events'],['partners','partners']].forEach(([key,attr])=>{const el=qs(`[data-stat="${attr}"]`);if(el)el.textContent=Number(data.stats[key]||0).toLocaleString('pt-PT')})}
function getNextRace(){const now=new Date(); return data.races.filter(r=>new Date(r.date+'T23:59:59')>=now).sort((a,b)=>a.date.localeCompare(b.date))[0]||data.races[0]}
function renderNextRace(){
  const r=getNextRace(); if(!r)return;
  const statusPT={next:'PRÓXIMA',upcoming:'A SEGUIR',featured:'EM DESTAQUE',done:'REALIZADA'}; qs('#nextRaceImage').style.backgroundImage=`url("${normalizeImage(r.image)}")`; qs('#nextRaceName').textContent=r.name; qs('#nextRaceLocation').textContent=r.circuit||r.location; qs('#nextRaceDate').textContent=formatRange(r); qs('#nextRaceCategory').textContent=r.category; qs('#nextRaceStatus').textContent=statusPT[r.status]||String(r.status||'PRÓXIMA').toUpperCase(); qs('#nextRaceDescription').textContent=r.description||'';
  updateCountdown(r);
}
function formatRange(r){const a=new Date(r.date+'T12:00:00'),b=new Date((r.endDate||r.date)+'T12:00:00');const m=new Intl.DateTimeFormat('pt-PT',{month:'long'}).format(a).toUpperCase();const da=String(a.getDate()).padStart(2,'0');const db=String(b.getDate()).padStart(2,'0');return a.getMonth()===b.getMonth()?`${da} — ${db} ${m} ${a.getFullYear()}`:`${da} ${a.toLocaleString('pt-PT',{month:'short'}).toUpperCase()} — ${db} ${b.toLocaleString('pt-PT',{month:'short'}).toUpperCase()} ${b.getFullYear()}`}
function updateCountdown(r){const tick=()=>{const diff=Math.max(0,new Date(r.date+'T09:00:00')-new Date());const d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60,s=Math.floor(diff/1000)%60;[['#cdDays',d],['#cdHours',h],['#cdMinutes',m],['#cdSeconds',s]].forEach(([sel,v])=>{const el=qs(sel);if(el)el.textContent=String(v).padStart(2,'0')})};tick();setInterval(tick,1000)}
let calCursor=new Date(); calCursor.setDate(1);
function renderCalendar(){
  const month=calCursor.getMonth(),year=calCursor.getFullYear(), first=new Date(year,month,1), last=new Date(year,month+1,0);
  qs('#todayMonth').textContent=new Intl.DateTimeFormat('pt-PT',{month:'long',year:'numeric'}).format(first).toUpperCase();
  let start=(first.getDay()+6)%7, cells=[]; for(let i=start-1;i>=0;i--){const d=new Date(year,month,1);d.setDate(-i);cells.push({d,muted:true})}
  for(let i=1;i<=last.getDate();i++)cells.push({d:new Date(year,month,i),muted:false}); while(cells.length%7) {const d=new Date(year,month,last.getDate()+cells.length%7); cells.push({d,muted:true})}
  const raceMap={}; data.races.forEach(r=>{raceMap[r.date]=r});
  qs('#calendarGrid').innerHTML=cells.map(({d,muted})=>{const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,r=raceMap[key];return `<div class="cal-day ${muted?'muted':''}"><span class="cal-num">${d.getDate()}</span>${r?`<button class="cal-event ${r.status==='featured'?'featured':''} ${r.status==='done'?'done':''}" data-race="${r.id}">${esc(r.name)}</button>`:''}</div>`}).join('');
  qs('#calendarGrid').querySelectorAll('[data-race]').forEach(b=>b.addEventListener('click',()=>openRace(b.dataset.race)));
  const visible=data.races.filter(r=>{const d=new Date(r.date+'T12:00:00');return d.getMonth()===month&&d.getFullYear()===year}).sort((a,b)=>a.date.localeCompare(b.date));
  qs('#raceCards').innerHTML=visible.length?visible.map(r=>`<button class="race-card" data-race="${r.id}"><div class="race-date">${String(new Date(r.date+'T12:00:00').getDate()).padStart(2,'0')}<small>${new Date(r.date+'T12:00:00').toLocaleString('pt-PT',{month:'short'}).toUpperCase()}</small></div><div><h4>${esc(r.name)}</h4><p>${esc(r.location)} • ${esc(r.circuit||'')}</p></div><span class="race-tag">${esc(({next:'PRÓXIMA',upcoming:'A SEGUIR',featured:'EM DESTAQUE',done:'REALIZADA'}[r.status]||'PRÓXIMA'))}</span></button>`).join(''):'<div class="empty">Não existem provas neste mês.</div>';
  qs('#raceCards').querySelectorAll('[data-race]').forEach(b=>b.addEventListener('click',()=>openRace(b.dataset.race)));
}
function openRace(id){const r=data.races.find(x=>x.id===id);if(!r)return;qs('#raceModalBody').innerHTML=`<p class="kicker">${esc(r.status||'PROVA')}</p><h3>${esc(r.name)}</h3><div class="modal-detail"><div><span>DATA</span><b>${formatRange(r)}</b></div><div><span>LOCALIZAÇÃO</span><b>${esc(r.location)}</b></div><div><span>CIRCUITO</span><b>${esc(r.circuit)}</b></div><div><span>CATEGORIA</span><b>${esc(r.category)}</b></div></div><p>${esc(r.description||'')}</p>${r.result?`<p><strong>Resultado:</strong> ${esc(r.result)}</p>`:''}${r.link?`<p><a class="text-link" href="${esc(r.link)}" target="_blank" rel="noreferrer">VER PROVA →</a></p>`:''}`;qs('#raceModal').classList.add('open')}
let galleryItems=[],galleryIndex=0;
function renderGallery(){
  const filter=qs('#galleryFilters .filter.active')?.dataset.filter||'all', search=(qs('#gallerySearch')?.value||'').toLowerCase().trim();
  galleryItems=data.photos.filter(p=>(filter==='all'||p.category===filter)&&(!search||[p.title,p.event,p.driver,p.location,p.category].join(' ').toLowerCase().includes(search))).sort((a,b)=>(a.order||0)-(b.order||0));
  qs('#galleryGrid').innerHTML=galleryItems.length?galleryItems.map((p,i)=>`<article class="gallery-item" data-i="${i}"><img loading="lazy" src="${normalizeImage(p.image)}" alt="${esc(p.title)}"><div class="gallery-overlay"><small>${esc(p.category)} • ${esc(p.event)}</small><strong>${esc(p.title)}</strong></div></article>`).join(''):'<div class="empty" style="grid-column:1/-1">Não existem fotografias com estes filtros.</div>';
  qs('#galleryGrid').querySelectorAll('.gallery-item').forEach(el=>el.addEventListener('click',()=>openLightbox(+el.dataset.i)));
}
function openLightbox(i){galleryIndex=i;const p=galleryItems[i];if(!p)return;qs('#lbImage').src=normalizeImage(p.image);qs('#lbImage').alt=p.title;qs('#lbTitle').textContent=p.title;qs('#lbMeta').textContent=`${p.event} • ${p.driver} • ${fmtDate(p.date)} • ${p.location}`;qs('#lbDescription').textContent=p.description||'';qs('#lightbox').classList.add('open');document.body.style.overflow='hidden'}
function stepLightbox(dir){galleryIndex=(galleryIndex+dir+galleryItems.length)%galleryItems.length;openLightbox(galleryIndex)}
function renderFeatured(){const p=data.photos.find(x=>x.featured)||data.photos[0];if(!p)return;qs('#featuredShot').innerHTML=`<div class="shot-image" style="background-image:url('${normalizeImage(p.image)}')"></div><div class="shot-copy"><span class="shot-label">SHOT OF THE WEEK</span><h3>${esc(p.title)} <span>/</span> ${esc(p.event)}</h3><p>${esc(p.description)}</p><div class="shot-meta"><span>09 / PROVA <b>${esc(p.event)}</b></span><span>PILOTO / EQUIPA <b>${esc(p.driver)}</b></span><span>LOCAL <b>${esc(p.location)}</b></span><span>DATA <b>${fmtDate(p.date)}</b></span></div></div>`}
function renderPartners(){const list=data.partners.filter(p=>p.active).sort((a,b)=>(a.order||0)-(b.order||0));qs('#partnersGrid').innerHTML=list.length?list.map(p=>`<article class="partner-card"><img src="${normalizeImage(p.logo)}" alt="${esc(p.name)}"><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><span class="partner-type">${esc(p.category)}</span></article>`).join(''):'<div class="empty" style="grid-column:1/-1">Não existem parceiros ativos.</div>'}
function renderNews(){const list=data.news.filter(n=>n.published).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);qs('#newsGrid').innerHTML=list.map(n=>`<article class="news-card"><img loading="lazy" src="${normalizeImage(n.image)}" alt="${esc(n.title)}"><div class="news-copy"><small>${esc(n.category)} • ${fmtDate(n.date)}</small><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><button class="readmore" data-news="${n.id}">LER NOTÍCIA →</button></div></article>`).join('');qs('#newsGrid').querySelectorAll('[data-news]').forEach(b=>b.addEventListener('click',()=>openNews(b.dataset.news)))}
function openNews(id){const n=data.news.find(x=>x.id===id);if(!n)return;qs('#raceModalBody').innerHTML=`<p class="kicker">${esc(n.category)} • ${fmtDate(n.date)}</p><h3>${esc(n.title)}</h3><p>${esc(n.content)}</p>`;qs('#raceModal').classList.add('open')}
function renderResults(){const cats=[...new Set(data.results.map(r=>r.category))];qs('#resultFilter').innerHTML='<option value="all">Todas as categorias</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');const filter=qs('#resultFilter').value||'all';qs('#resultsBody').innerHTML=data.results.filter(r=>filter==='all'||r.category===filter).sort((a,b)=>a.date.localeCompare(b.date)).map(r=>`<tr><td>${esc(r.race)}</td><td>${fmtDate(r.date)}</td><td>${esc(r.driver)}</td><td>${esc(r.category)}</td><td>${esc(r.position)}</td><td>${esc(r.time)}</td><td>${esc(r.notes)}</td></tr>`).join('')}
function bindUI(){
  qs('#menuToggle')?.addEventListener('click',()=>qs('#mainNav').classList.toggle('open'));
  qs('#mainNav')?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>qs('#mainNav').classList.remove('open')));
  qs('#prevMonth').onclick=()=>{calCursor.setMonth(calCursor.getMonth()-1);renderCalendar()};qs('#nextMonth').onclick=()=>{calCursor.setMonth(calCursor.getMonth()+1);renderCalendar()};qs('#todayMonth').onclick=()=>{calCursor=new Date();calCursor.setDate(1);renderCalendar()};
  qs('#gallerySearch').addEventListener('input',renderGallery);qs('#galleryFilters').querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{qs('#galleryFilters .active').classList.remove('active');b.classList.add('active');renderGallery()}));qs('#resultFilter').addEventListener('change',renderResults);
  qs('#lbClose').onclick=closeLightbox;qs('#lbPrev').onclick=()=>stepLightbox(-1);qs('#lbNext').onclick=()=>stepLightbox(1);qs('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLightbox();qs('#raceModal').classList.remove('open')}});document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>qs('#'+b.dataset.close).classList.remove('open'));
  qs('#contactForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);data.messages.push({id:Date.now().toString(),date:new Date().toISOString(),...Object.fromEntries(fd.entries()),read:false});saveData();qs('#formNote').textContent='Mensagem guardada localmente. Liga um backend/API quando quiseres envio real.';e.currentTarget.reset()})
}
function closeLightbox(){qs('#lightbox').classList.remove('open');document.body.style.overflow=''}
function setupReveal(){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>obs.observe(x))}
window.TPData={data,saveData,reload:()=>{data=loadData();location.reload()}};