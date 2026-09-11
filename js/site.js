const KEY='telmoPartilhasDataV1';
const COMPETITION_CATEGORIES=['Super Cars','opens','s1600','2rm 2.0','2rm 1.6','kart cross','Iniciados 1.6','iniciados 1.0'];

function deepClone(o){return JSON.parse(JSON.stringify(o))}
function normalizeCompetitionCategories(d){
  const legacy={Rallycross:'Super Cars',Motorsport:'opens'};
  [...(d.races||[]),...(d.results||[])].forEach(item=>{ if(legacy[item.category]) item.category=legacy[item.category]; });
  return d;
}
function loadData(){try{const raw=localStorage.getItem(KEY);const d=raw?Object.assign(deepClone(window.TP_DEFAULT_DATA),JSON.parse(raw)):deepClone(window.TP_DEFAULT_DATA);return normalizeCompetitionCategories(d)}catch(e){return normalizeCompetitionCategories(deepClone(window.TP_DEFAULT_DATA))}}
function saveData(d){localStorage.setItem(KEY,JSON.stringify(d));if(window.TPCloud)window.TPCloud.pushData(d)}
function fmtDate(s){return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(s+'T12:00:00'))}
function fmtShort(s){return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s+'T12:00:00')).replace('.','').toUpperCase()}
const data=loadData();
function el(sel){return document.querySelector(sel)}
function renderSettings(){el('#heroTitle').textContent=data.settings.heroTitle;el('#heroSubtitle').textContent=data.settings.heroSubtitle;el('#aboutText').textContent=data.settings.about;el('#footerYear').textContent=String(new Date().getFullYear());}
function renderStats(){el('#statsGrid').innerHTML=data.stats.map(s=>`<div class="stat"><div class="value">${s[0]}</div><div class="label">${s[1]}</div></div>`).join('')}
function nextRace(){return [...data.races].filter(r=>r.status==='next').sort((a,b)=>a.date.localeCompare(b.date))[0]||data.races.slice().sort((a,b)=>a.date.localeCompare(b.date))[0]}
function renderNextRace(){const r=nextRace();if(!r)return;el('#nextName').textContent=r.name;el('#nextLocation').textContent=r.location;el('#nextDate').textContent=`${fmtShort(r.date)}${r.endDate&&r.endDate!==r.date?' — '+fmtShort(r.endDate):''}`;el('#nextCountry').textContent=(r.country||'Portugal').toUpperCase();el('#nextCategory').textContent=(r.category||'Rallycross').toUpperCase();el('#nextCircuit').textContent=r.circuit||r.location;el('#nextCategory2').textContent=r.category;el('#nextRaceMedia').style.backgroundImage=`url("${r.image}")`;el('#nextRaceMedia').style.backgroundSize='cover';el('#nextRaceMedia').style.backgroundPosition='center';startCountdown(r.date+'T09:00:00')}
let countdownTimer;function startCountdown(target){clearInterval(countdownTimer);function tick(){const d=new Date(target).getTime()-Date.now();const box=el('#countdown');if(d<=0){box.innerHTML='<div class="timebox"><strong>00</strong><span>DIAS</span></div>'.repeat(4);return}const day=Math.floor(d/86400000),hr=Math.floor((d%86400000)/3600000),min=Math.floor((d%3600000)/60000),sec=Math.floor((d%60000)/1000);box.innerHTML=[[day,'DIAS'],[hr,'HORAS'],[min,'MIN'],[sec,'SEG']].map(x=>`<div class="timebox"><strong>${String(x[0]).padStart(2,'0')}</strong><span>${x[1]}</span></div>`).join('')}tick();countdownTimer=setInterval(tick,1000)}
function renderCalendar(){const cats=COMPETITION_CATEGORIES.filter(c=>data.races.some(r=>r.category===c));el('#calendarFilters').innerHTML='<button class="filter-btn active" data-cal="all">TODAS</button>'+cats.map(c=>`<button class="filter-btn" data-cal="${c}">${c}</button>`).join('');renderCalendarList('all');document.querySelectorAll('[data-cal]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-cal]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderCalendarList(b.dataset.cal)})}
function renderCalendarList(filter){const races=data.races.slice().sort((a,b)=>a.date.localeCompare(b.date)).filter(r=>filter==='all'||r.category===filter);el('#calendarList').innerHTML=races.map(r=>`<article class="timeline-item" data-id="${r.id}"><div class="timeline-date">${fmtShort(r.date)}</div><div class="timeline-content"><h3>${r.name}</h3><p>${r.location} · ${r.circuit} · ${r.country}</p></div><button class="status-pill ${r.status==='next'?'next':''}${r.status==='featured'?' featured':''}" data-race="${r.id}">${r.status==='next'?'PRÓXIMA':r.status==='featured'?'EM DESTAQUE':'REALIZADA'}</button></article>`).join('');document.querySelectorAll('[data-race]').forEach(b=>b.onclick=()=>openRaceModal(b.dataset.race));}
function renderGallery(){const cats=['TODAS','RALLYCROSS','MOTORSPORT','EVENTOS','PILOTOS'];el('#galleryFilters').innerHTML=cats.map((c,i)=>`<button class="filter-btn ${i===0?'active':''}" data-gallery="${c}">${c}</button>`).join('');renderGalleryList('TODAS','');document.querySelectorAll('[data-gallery]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-gallery]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderGalleryList(b.dataset.gallery,el('#gallerySearch').value)})}
function renderGalleryList(filter,search){const items=data.gallery.filter(g=>(filter==='TODAS'||g.category.toUpperCase()===filter)&&(String(g.title)+' '+String(g.event)+' '+String(g.driver)).toLowerCase().includes(search.toLowerCase()));el('#galleryGrid').innerHTML=items.map(g=>`<article class="gallery-item" data-id="${g.id}"><img src="${g.image}" loading="lazy" alt="${g.title}"><div class="gallery-caption"><small>${g.category} · ${g.event}</small><strong>${g.title}</strong></div></article>`).join('')||'<div class="empty-state">Sem fotografias para este filtro.</div>';document.querySelectorAll('.gallery-item').forEach(x=>x.onclick=()=>openGalleryModal(x.dataset.id))}
el('#gallerySearch').addEventListener('input',()=>{const active=el('.filter-btn[data-gallery].active');renderGalleryList(active?active.dataset.gallery:'TODAS',el('#gallerySearch').value)})
function renderShot(){const g=data.gallery.find(x=>x.id===data.featuredGalleryId)||data.gallery[0];if(!g)return;el('#shotCard').innerHTML=`<div class="shot-image" style="background-image:url('${g.image}')"></div><div class="shot-copy"><div class="section-kicker">SHOT OF THE WEEK</div><h3>${g.title}</h3><p>${g.description}</p><div class="shot-facts"><div><span>PROVA</span><b>${g.event}</b></div><div><span>PILOTO</span><b>${g.driver}</b></div><div><span>LOCAL</span><b>${g.location}</b></div><div><span>DATA</span><b>${fmtShort(g.date)}</b></div></div></div>`}
function renderPartners(){const ps=data.partners.filter(p=>p.active).sort((a,b)=>a.order-b.order);el('#partnersGrid').innerHTML=ps.map(p=>`<article class="partner-card"><div class="partner-badge">${p.category}</div><div class="partner-logo"><img src="${p.logo}" alt="${p.name}"></div><h3>${p.name}</h3><p>${p.description}</p><div class="partner-links">${p.website&&p.website!=='#'?`<a href="${p.website}" target="_blank">WEBSITE</a>`:''}${p.instagram&&p.instagram!=='#'?`<a href="${p.instagram}" target="_blank">INSTAGRAM</a>`:''}${p.facebook&&p.facebook!=='#'?`<a href="${p.facebook}" target="_blank">FACEBOOK</a>`:''}</div></article>`).join('')||'<div class="empty-state">Ainda não existem parceiros ativos.</div>'}
function renderNews(){const ns=data.news.filter(n=>n.published).sort((a,b)=>b.date.localeCompare(a.date));el('#newsGrid').innerHTML=ns.map(n=>`<article class="news-card" data-news="${n.id}"><img src="${n.image}" loading="lazy" alt="${n.title}"><div class="news-copy"><div class="news-meta">${n.category} · ${fmtDate(n.date)}</div><h3>${n.title}</h3><p>${n.summary}</p></div></article>`).join('')||'<div class="empty-state">Sem notícias publicadas.</div>';document.querySelectorAll('[data-news]').forEach(c=>c.onclick=()=>openNewsModal(c.dataset.news))}
function renderResults(){const years=[...new Set(data.results.map(r=>r.date.slice(0,4)))];const races=[...new Set(data.results.map(r=>r.race))];el('#resultYear').innerHTML='<option value="all">Todos os anos</option>'+years.map(y=>`<option>${y}</option>`).join('');el('#resultCategory').innerHTML='<option value="all">Todas as categorias</option>'+COMPETITION_CATEGORIES.map(c=>`<option>${c}</option>`).join('');el('#resultRace').innerHTML='<option value="all">Todas as provas</option>'+races.map(r=>`<option>${r}</option>`).join('');const paint=()=>{const y=el('#resultYear').value,c=el('#resultCategory').value,r=el('#resultRace').value;const rows=data.results.filter(x=>(y==='all'||x.date.startsWith(y))&&(c==='all'||x.category===c)&&(r==='all'||x.race===r));el('#resultsBody').innerHTML=rows.map(x=>`<tr><td>${x.race}</td><td>${fmtShort(x.date)}</td><td>${x.driver}</td><td>${x.category}</td><td><b>${x.position}</b></td><td>${x.time}</td><td>${x.notes}</td></tr>`).join('')||'<tr><td colspan="7">Sem resultados para os filtros selecionados.</td></tr>'};['#resultYear','#resultCategory','#resultRace'].forEach(s=>el(s).addEventListener('change',paint));paint()}
function renderContacts(){el('#contactList').innerHTML=`<a href="mailto:${data.settings.email}"><span>EMAIL</span><strong>${data.settings.email}</strong></a><a href="${data.settings.instagram}" target="_blank"><span>INSTAGRAM</span><strong>Instagram ↗</strong></a><a href="${data.settings.facebook}" target="_blank"><span>FACEBOOK</span><strong>Facebook ↗</strong></a><div><span>LOCALIZAÇÃO</span><strong>${data.settings.location}</strong></div>`;el('#socialLinks').innerHTML=`<a class="social-btn" href="${data.settings.instagram}" target="_blank">Instagram ↗</a><a class="social-btn" href="${data.settings.facebook}" target="_blank">Facebook ↗</a>`}
function openModal(html){el('#modalBody').innerHTML=html;el('#modal').classList.add('open');el('#modal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function closeModal(){el('#modal').classList.remove('open');el('#modal').setAttribute('aria-hidden','true');document.body.style.overflow=''}
el('#modalClose').onclick=closeModal;document.querySelector('.modal-backdrop').onclick=closeModal;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()})
function openGalleryModal(id){const g=data.gallery.find(x=>x.id===id);if(!g)return;openModal(`<img class="modal-photo" src="${g.image}" alt="${g.title}"><div class="modal-copy"><div class="modal-meta">${g.category} · ${g.event} · ${fmtShort(g.date)}</div><h3>${g.title}</h3><p>${g.description}</p><p><strong>${g.driver}</strong> · ${g.location}</p></div>`)}
function openRaceModal(id){const r=data.races.find(x=>x.id===id);if(!r)return;openModal(`<img class="modal-photo" src="${r.image}" alt="${r.name}"><div class="modal-copy"><div class="modal-meta">${r.category} · ${r.country} · ${fmtShort(r.date)}</div><h3>${r.name}</h3><p>${r.description}</p><p><strong>${r.location}</strong> · ${r.circuit}</p>${r.result?`<p>Resultado: ${r.result}</p>`:''}${r.link?`<p><a href="${r.link}" target="_blank" style="color:var(--teal)">Abrir link ↗</a></p>`:''}</div>`)}
function openNewsModal(id){const n=data.news.find(x=>x.id===id);if(!n)return;openModal(`<img class="modal-photo" src="${n.image}" alt="${n.title}"><div class="modal-copy"><div class="modal-meta">${n.category} · ${fmtShort(n.date)}</div><h3>${n.title}</h3><p>${n.content}</p></div>`)}
function initReveal(){const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.14});document.querySelectorAll('.section-head,.split-head,.stats-grid,.next-race-card,.gallery-grid,.shot-card,.partners-grid,.news-grid,.contact-grid,.partner-cta-inner,.socials-inner').forEach(x=>{x.classList.add('reveal');observer.observe(x)})}
function initMenu(){const t=el('#menuToggle'),n=el('#mainNav');t.onclick=()=>{const open=n.classList.toggle('open');t.setAttribute('aria-expanded',open)};n.querySelectorAll('a').forEach(a=>a.onclick=()=>n.classList.remove('open'))}
el('#contactForm').addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.target);const message={date:new Date().toISOString(),name:fd.get('name'),email:fd.get('email'),subject:fd.get('subject'),message:fd.get('message'),read:false};const inbox=JSON.parse(localStorage.getItem('telmoPartilhasMessages')||'[]');inbox.unshift({...message,id:Date.now()});localStorage.setItem('telmoPartilhasMessages',JSON.stringify(inbox));const cloud=window.TPCloud?await window.TPCloud.addMessage(message):false;e.target.reset();el('#formNote').textContent=cloud?'Mensagem enviada e sincronizada com a Cloudflare.':'Mensagem guardada neste navegador. A sincronização Cloudflare estará ativa quando o site estiver publicado na Cloudflare.'})
function initSiteMotion(){
  const header=el('.site-header');
  const hero=el('.hero-backdrop');
  const onScroll=()=>{
    const y=window.scrollY||0;
    header.classList.toggle('scrolled',y>24);
    if(hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){hero.style.transform=`translate3d(0,${Math.min(y*0.045,36)}px,0) scale(1.045)`;}
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
}
function initStatCounters(){
  const items=[...document.querySelectorAll('.stat .value')];
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting || entry.target.dataset.counted)return;
      entry.target.dataset.counted='1';
      const final=entry.target.textContent.trim();
      const match=final.match(/^(\d+)(.*)$/);
      if(!match)return;
      const target=Number(match[1]); const suffix=match[2]||''; const duration=900; const start=performance.now();
      const tick=(now)=>{
        const p=Math.min(1,(now-start)/duration); const eased=1-Math.pow(1-p,3);
        entry.target.textContent=String(Math.round(target*eased)).padStart(target>=10?2:1,'0')+suffix;
        if(p<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },{threshold:.45});
  items.forEach(x=>observer.observe(x));
}
function render(){renderSettings();renderStats();renderNextRace();renderCalendar();renderGallery();renderShot();renderPartners();renderNews();renderResults();renderContacts();initReveal();initMenu();initSiteMotion();initStatCounters()}
render();
(async()=>{try{const remote=window.TPCloud?await window.TPCloud.pullData(data):null;if(remote&&remote!==data){Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,remote);render();}}catch(e){}})();
