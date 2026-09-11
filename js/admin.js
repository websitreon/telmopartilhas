const KEY='telmoPartilhasDataV1';
const MSG='telmoPartilhasMessages';
const COMPETITION_CATEGORIES=['Super Cars','opens','s1600','2rm 2.0','2rm 1.6','kart cross','Iniciados 1.6','iniciados 1.0'];
const defaultFallback=window.parent?.defaultData;
const defaultData=window.TP_DEFAULT_DATA;
let realDefault=null; // populated through reset by loading defaults from a lightweight template below
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d){const legacy={Rallycross:'Super Cars',Motorsport:'opens'};[...(d.races||[]),...(d.results||[])].forEach(x=>{if(legacy[x.category])x.category=legacy[x.category]});return d}}catch(e){}return JSON.parse(JSON.stringify(defaultData))}
let data=load();
let cloudMessages=[];
let cloudMode=false;
const app=document.querySelector('#adminApp'), gate=document.querySelector('#loginGate'), view=document.querySelector('#view');
const el=(selector)=>document.querySelector(selector);
function getMessages(){if(Array.isArray(cloudMessages)&&cloudMode)return cloudMessages;try{return JSON.parse(localStorage.getItem(MSG)||'[]')}catch(e){return[]}}
const icons={dashboard:'Dashboard',photos:'Fotografias',calendar:'Calendário / Provas',results:'Resultados',partners:'Parceiros',news:'Notícias',texts:'Textos',messages:'Mensagens',settings:'Configurações'};
function save(){localStorage.setItem(KEY,JSON.stringify(data));document.querySelector('#storageState').textContent='A sincronizar…';if(window.TPCloud){window.TPCloud.pushData(data).then(r=>{const ok=r&&r.ok!==false;cloudMode=ok;document.querySelector('#storageState').textContent=ok?'Sincronizado com Cloudflare · '+new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):'Guardado localmente · Cloudflare indisponível';});}else{document.querySelector('#storageState').textContent='Guardado localmente · '+new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}}
function esc(s=''){return String(s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#92;'}[m]))}
function uid(prefix){return prefix+Math.random().toString(36).slice(2,8)}
function datePt(s){return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s+'T12:00:00'))}
function formField(label,name,value='',type='text',extra=''){return `<div class="field ${extra}"><label>${label}</label>${type==='textarea'?`<textarea name="${name}">${esc(value)}</textarea>`:type==='select'?`<select name="${name}">${value}</select>`:`<input type="${type}" name="${name}" value="${esc(value)}">`}</div>`}
function imageField(label,name,value='',extra='full'){return `<div class="field ${extra}"><label>${label}</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input style="flex:1;min-width:220px" type="text" name="${name}" value="${esc(value)}" data-image-target="${name}"><input type="file" accept="image/*" data-image-upload="${name}"><button type="button" class="ghost" data-upload-btn="${name}">CARREGAR</button></div><small data-upload-status="${name}" style="display:block;margin-top:7px;color:#7f8b87">Podes usar um URL ou carregar uma imagem para o R2.</small></div>`}
async function compressImageToDataURL(file, maxSide=1800, quality=0.78){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('Imagem inválida.'));
      img.onload=()=>{
        const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
        canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
async function wireImageUploads(){
  document.querySelectorAll('[data-upload-btn]').forEach(btn=>btn.onclick=async()=>{
    const name=btn.dataset.uploadBtn;
    const file=document.querySelector(`[data-image-upload="${name}"]`)?.files?.[0];
    const target=document.querySelector(`[data-image-target="${name}"]`);
    const status=document.querySelector(`[data-upload-status="${name}"]`);
    if(!file){status.textContent='Escolhe primeiro uma imagem.';return}
    btn.disabled=true;
    status.textContent='A preparar a imagem…';
    try{
      let uploaded=false;
      try{
        const fd=new FormData();fd.append('file',file);
        const r=await fetch('/api/upload',{method:'POST',body:fd,credentials:'same-origin'});
        const text=await r.text();
        let j={};try{j=JSON.parse(text)}catch{}
        if(r.ok&&j.ok&&j.url){target.value=j.url;status.textContent='Imagem carregada para a Cloudflare.';uploaded=true;}
      }catch{}
      if(!uploaded){
        const dataUrl=await compressImageToDataURL(file);
        if(dataUrl.length>900000) throw new Error('A imagem continua demasiado grande depois da compressão. Escolhe uma imagem mais pequena.');
        target.value=dataUrl;
        status.textContent='Imagem preparada. Ao guardar, fica sincronizada com o conteúdo do site.';
      }
    }catch(e){status.textContent=e.message||'Não foi possível preparar a imagem.'}
    finally{btn.disabled=false}
  })
}

function formShell(title,fields,actions){return `<div class="card form-card"><div class="toolbar"><h2>${title}</h2></div><form id="editorForm">${fields}<div class="form-actions">${actions||'<button class="primary" type="submit">GUARDAR</button>'}</div></form></div>`}
function go(v){document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.querySelector('#pageTitle').textContent=icons[v];document.querySelector('#currentViewLabel').textContent=icons[v].toUpperCase();({dashboard:renderDashboard,photos:renderPhotos,calendar:renderCalendar,results:renderResults,partners:renderPartners,news:renderNews,texts:renderTexts,messages:renderMessages,settings:renderSettings}[v]||renderDashboard)()}
function renderDashboard(){const msgs=getMessages();const unread=msgs.filter(m=>!m.read).length;const next=data.races.find(r=>r.status==='next');const stats=[['FOTOGRAFIAS',data.gallery.length],['PROVAS',data.races.length],['PRÓXIMA',data.races.filter(r=>r.status==='next').length],['PARCEIROS',data.partners.filter(p=>p.active).length],['NOTÍCIAS',data.news.filter(n=>n.published).length],['MENSAGENS',unread]];view.innerHTML=`<div class="dashboard-grid">${stats.map(s=>`<div class="card metric"><strong>${s[1]}</strong><span>${s[0]}</span></div>`).join('')}</div><div class="grid-two"><div class="card chart"><div class="chart-head"><div><div class="eyebrow">VISÃO DO CONTEÚDO</div><h2 style="font-family:'Barlow Condensed';margin:7px 0 0;font-size:31px;text-transform:uppercase">Tudo num só lugar</h2></div><span class="storage-state">${unread?unread+' por ler':'Tudo em dia'}</span></div><div class="bars">${[data.gallery.length,data.races.length,data.news.length,data.partners.length,data.results.length].map((v,i)=>`<div class="bar" style="height:${Math.max(8,Math.min(100,v*13))}%"><span>${['Fotos','Provas','Notícias','Parceiros','Resultados'][i]}</span></div>`).join('')}</div></div><div class="card"><div class="eyebrow">ACESSO RÁPIDO</div><div class="quick-actions"><a class="quick-action" href="#" data-quick="photos">Fotografias <small>Gerir galeria e destaque</small></a><a class="quick-action" href="#" data-quick="calendar">Calendário <small>Adicionar e editar provas</small></a><a class="quick-action" href="#" data-quick="news">Notícias <small>Publicar e atualizar</small></a><a class="quick-action" href="#" data-quick="messages">Mensagens <small>${unread?unread+' por ler':'Nenhuma pendente'}</small></a></div><div class="dashboard-note"><b>Próxima prova:</b> ${next?esc(next.name)+' · '+datePt(next.date):'Nenhuma definida'}<br><b>Fotografia de destaque:</b> ${data.gallery.find(g=>g.id===data.featuredGalleryId)?.title||'Nenhuma definida'}</div></div></div>`;document.querySelectorAll('[data-quick]').forEach(a=>a.onclick=e=>{e.preventDefault();go(a.dataset.quick)})}
function renderPhotos(){
  view.innerHTML=`
  <div class="photo-toolbar card">
    <div class="photo-tools-top">
      <div>
        <div class="eyebrow">BIBLIOTECA DE FOTOGRAFIA</div>
        <h2 class="section-title">Fotografias organizadas</h2>
        <p class="section-help">Filtra, pesquisa, ordena e define a fotografia de destaque sem editar o HTML.</p>
      </div>
      <button class="primary" id="newPhoto">+ ADICIONAR FOTOGRAFIA</button>
    </div>
    <div class="photo-filters">
      <label class="searchbox"><span>⌕</span><input id="photoSearch" type="search" placeholder="Pesquisar título, prova, piloto..." /></label>
      <select id="photoCategory">
        <option value="all">Todas as categorias</option>
        ${COMPETITION_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}<option>Pilotos</option><option>Equipas</option><option>Circuitos</option><option>Backstage</option><option>Destaques</option>
      </select>
      <select id="photoSort">
        <option value="manual">Ordem manual</option>
        <option value="newest">Mais recentes</option>
        <option value="oldest">Mais antigas</option>
        <option value="title">Título A–Z</option>
        <option value="featured">Destaque primeiro</option>
      </select>
      <div class="photo-count" id="photoCount"></div>
    </div>
    <div class="photo-hint"><span>ARRASTA</span> uma fotografia para alterar a ordem manualmente · o destaque fica sempre sinalizado.</div>
  </div>
  <div class="photo-grid" id="photoList"></div>`;

  const normalize=()=>{
    data.gallery.forEach((g,i)=>{if(typeof g.order!=='number')g.order=i});
  };
  normalize();
  const getFiltered=()=>{
    const q=(document.querySelector('#photoSearch').value||'').trim().toLowerCase();
    const cat=document.querySelector('#photoCategory').value;
    const sort=document.querySelector('#photoSort').value;
    let arr=data.gallery.filter(g=>{
      const hay=[g.title,g.event,g.driver,g.location,g.category].join(' ').toLowerCase();
      return (!q||hay.includes(q)) && (cat==='all'||g.category===cat);
    });
    if(sort==='newest')arr.sort((a,b)=>b.date.localeCompare(a.date));
    else if(sort==='oldest')arr.sort((a,b)=>a.date.localeCompare(b.date));
    else if(sort==='title')arr.sort((a,b)=>a.title.localeCompare(b.title,'pt'));
    else if(sort==='featured')arr.sort((a,b)=>(data.featuredGalleryId===b.id)-(data.featuredGalleryId===a.id)||a.order-b.order);
    else arr.sort((a,b)=>a.order-b.order);
    return arr;
  };
  const paint=()=>{
    const arr=getFiltered();
    document.querySelector('#photoCount').textContent=`${arr.length} de ${data.gallery.length} fotografias`;
    document.querySelector('#photoList').innerHTML=arr.map((g,i)=>`
      <article class="photo-admin-card" draggable="${document.querySelector('#photoSort').value==='manual'}" data-card-id="${g.id}">
        <div class="photo-number">${String(i+1).padStart(2,'0')}</div>
        <div class="photo-image-wrap">
          <img loading="lazy" src="${esc(g.image)}" alt="${esc(g.title)}">
          <div class="photo-image-top"><span class="photo-category">${esc(g.category)}</span>${data.featuredGalleryId===g.id?'<span class="feature-tag">★ DESTAQUE</span>':''}</div>
          <div class="photo-hover-meta"><span>${esc(g.event)}</span><span>${datePt(g.date)}</span></div>
        </div>
        <div class="photo-admin-body">
          <div class="photo-meta-row"><span>${esc(g.location)}</span><span>${esc(g.driver)}</span></div>
          <h3>${esc(g.title)}</h3>
          <p>${esc(g.description||'Sem descrição.')}</p>
          <div class="mini-actions">
            <button class="ghost" data-edit="${g.id}">EDITAR</button>
            <button class="ghost ${data.featuredGalleryId===g.id?'is-featured':''}" data-feature="${g.id}">${data.featuredGalleryId===g.id?'★ DESTAQUE':'☆ DESTACAR'}</button>
            <button class="danger" data-del="${g.id}">APAGAR</button>
          </div>
        </div>
      </article>`).join('')||'<div class="empty">Não foram encontradas fotografias com estes filtros.</div>';
    bind();
  };
  const bind=()=>{
    document.querySelector('#newPhoto').onclick=()=>photoForm();
    document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>photoForm(b.dataset.edit));
    document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Apagar fotografia?')){data.gallery=data.gallery.filter(g=>g.id!==b.dataset.del);save();paint()}});
    document.querySelectorAll('[data-feature]').forEach(b=>b.onclick=()=>{data.featuredGalleryId=data.featuredGalleryId===b.dataset.feature?null:b.dataset.feature;save();paint()});
    if(document.querySelector('#photoSort').value==='manual'){
      let dragged=null;
      document.querySelectorAll('.photo-admin-card').forEach(card=>{
        card.addEventListener('dragstart',()=>{dragged=card;card.classList.add('dragging')});
        card.addEventListener('dragend',()=>{dragged=null;card.classList.remove('dragging')});
        card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('drag-over')});
        card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
        card.addEventListener('drop',e=>{
          e.preventDefault();card.classList.remove('drag-over');
          if(!dragged||dragged===card)return;
          const fromId=dragged.dataset.cardId,toId=card.dataset.cardId;
          const from=data.gallery.findIndex(g=>g.id===fromId),to=data.gallery.findIndex(g=>g.id===toId);
          if(from<0||to<0)return;
          const [item]=data.gallery.splice(from,1);data.gallery.splice(to,0,item);data.gallery.forEach((g,i)=>g.order=i);save();paint();
        });
      });
    }
  };
  ['photoSearch','photoCategory','photoSort'].forEach(id=>document.querySelector('#'+id).addEventListener('input',paint));
  paint();
}
function photoForm(id){
  const g=data.gallery.find(x=>x.id===id)||{
    id:uid('g'),title:'',image:'',category:'Super Cars',event:'',date:new Date().toISOString().slice(0,10),driver:'',location:'',description:'',order:data.gallery.length
  };
  const categoryOptions=[...COMPETITION_CATEGORIES,'Pilotos','Equipas','Circuitos','Backstage','Destaques'].map(c=>`<option ${g.category===c?'selected':''}>${c}</option>`).join('');
  view.innerHTML=formShell(id?'Editar fotografia':'Adicionar fotografia',`
    <div class="form-grid three">
      ${formField('Título','title',g.title)}
      ${formField('Data','date',g.date,'date')}
      ${formField('Categoria','category',categoryOptions,'select')}
      ${formField('Prova / evento','event',g.event)}
      ${formField('Piloto','driver',g.driver)}
      ${formField('Local','location',g.location)}
      ${imageField('Imagem','image',g.image,'full')}
      ${formField('Descrição','description',g.description,'textarea','full')}
    </div>
  `,`<button class="ghost" type="button" onclick="go('photos')">CANCELAR</button><button class="primary" type="submit">${id?'GUARDAR ALTERAÇÕES':'ADICIONAR FOTOGRAFIA'}</button>`);
  wireImageUploads();
  el('#editorForm').onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const image=String(fd.get('image')||'').trim();
    if(!image){alert('Adiciona uma fotografia através do botão CARREGAR ou coloca um URL.');return;}
    const obj={...g,title:String(fd.get('title')||''),date:String(fd.get('date')||''),category:String(fd.get('category')||'Super Cars'),event:String(fd.get('event')||''),driver:String(fd.get('driver')||''),location:String(fd.get('location')||''),image,description:String(fd.get('description')||''),order:typeof g.order==='number'?g.order:data.gallery.length};
    const ix=data.gallery.findIndex(x=>x.id===id);
    if(ix>=0)data.gallery[ix]=obj;else data.gallery.unshift(obj);
    if(!data.featuredGalleryId)data.featuredGalleryId=obj.id;
    save();
    alert('Fotografia guardada.');
    go('photos');
  };
}
function renderCalendar(){view.innerHTML=`<div class="toolbar"><div></div><div class="actions"><button class="primary" id="newRace">+ ADICIONAR PROVA</button></div></div><div class="card table-wrap"><table><thead><tr><th>Imagem</th><th>Prova</th><th>Data</th><th>Local</th><th>Categoria</th><th>Estado</th><th>Ações</th></tr></thead><tbody>${data.races.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(r=>`<tr><td><img class="thumb" src="${r.image}"></td><td>${esc(r.name)}</td><td>${datePt(r.date)}</td><td>${esc(r.location)}</td><td>${esc(r.category)}</td><td><span class="status ${r.status==='next'?'on':''}">${r.status==='next'?'PRÓXIMA':r.status==='featured'?'DESTAQUE':'REALIZADA'}</span></td><td><button class="ghost" data-edit-race="${r.id}">EDITAR</button> <button class="danger" data-del-race="${r.id}">APAGAR</button></td></tr>`).join('')}</tbody></table></div>`;document.querySelector('#newRace').onclick=()=>raceForm();document.querySelectorAll('[data-edit-race]').forEach(b=>b.onclick=()=>raceForm(b.dataset.editRace));document.querySelectorAll('[data-del-race]').forEach(b=>b.onclick=()=>{if(confirm('Apagar prova?')){data.races=data.races.filter(r=>r.id!==b.dataset.delRace);save();renderCalendar()}})}
function raceForm(id){const r=data.races.find(x=>x.id===id)||{id:uid('r'),name:'',date:'',endDate:'',location:'',circuit:'',country:'Portugal',category:'Super Cars',status:'next',image:'',description:'',link:'',result:''};view.innerHTML=formShell(id?'Editar prova':'Adicionar prova',`<div class="form-grid three">${formField('Nome','name',r.name)}${formField('Data','date',r.date,'date')}${formField('Data fim','endDate',r.endDate,'date')}${formField('Local','location',r.location)}${formField('Circuito','circuit',r.circuit)}${formField('País','country',r.country)}${formField('Categoria','category',`${COMPETITION_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}`,'select')}${formField('Estado','status',`<option value="next" ${r.status==='next'?'selected':''}>Próxima</option><option value="featured" ${r.status==='featured'?'selected':''}>Em destaque</option><option value="done" ${r.status==='done'?'selected':''}>Realizada</option>`,'select')}${imageField('Imagem','image',r.image,'full')}${formField('Link','link',r.link,'url')}${formField('Resultado','result',r.result)}${formField('Descrição','description',r.description,'textarea','full')}<div class="field full"><label class="toggle"><input name="clearNext" type="checkbox"> Tornar esta a única próxima prova</label></div></div>`,`<button class="ghost" type="button" onclick="go('calendar')">CANCELAR</button><button class="primary" type="submit">GUARDAR PROVA</button>`);wireImageUploads();el('#editorForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);const obj={...r,name:fd.get('name'),date:fd.get('date'),endDate:fd.get('endDate'),location:fd.get('location'),circuit:fd.get('circuit'),country:fd.get('country'),category:fd.get('category'),status:fd.get('status'),image:fd.get('image'),link:fd.get('link'),result:fd.get('result'),description:fd.get('description')};if(obj.status==='next'||fd.get('clearNext')==='on')data.races.forEach(x=>{if(x.id!==id&&fd.get('clearNext')==='on'||x.id!==id&&obj.status==='next')x.status='done'});const ix=data.races.findIndex(x=>x.id===id);if(ix>=0)data.races[ix]=obj;else data.races.unshift(obj);save();go('calendar')}}
function renderResults(){view.innerHTML=`<div class="toolbar"><div></div><button class="primary" id="newRes">+ ADICIONAR RESULTADO</button></div><div class="card table-wrap"><table><thead><tr><th>Prova</th><th>Data</th><th>Piloto</th><th>Categoria</th><th>Pos.</th><th>Tempo</th><th>Obs.</th><th></th></tr></thead><tbody>${data.results.map(r=>`<tr><td>${esc(r.race)}</td><td>${datePt(r.date)}</td><td>${esc(r.driver)}</td><td>${esc(r.category)}</td><td>${r.position}</td><td>${r.time}</td><td>${esc(r.notes)}</td><td><button class="danger" data-del-result="${r.id}">APAGAR</button></td></tr>`).join('')}</tbody></table></div>`;el('#newRes').onclick=()=>resultForm();document.querySelectorAll('[data-del-result]').forEach(b=>b.onclick=()=>{if(confirm('Apagar resultado?')){data.results=data.results.filter(x=>x.id!==b.dataset.delResult);save();renderResults()}})}
function resultForm(){const races=data.races.map(r=>`<option>${esc(r.name)}</option>`).join('');view.innerHTML=formShell('Adicionar resultado',`<div class="form-grid three">${formField('Prova','race',races,'select')}${formField('Data','date','','date')}${formField('Piloto','driver')}${formField('Categoria','category',`${COMPETITION_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}`,'select')}${formField('Posição','position')}${formField('Tempo','time')}${formField('Observações','notes','', 'text','full')}</div>`,`<button class="ghost" type="button" onclick="go('results')">CANCELAR</button><button class="primary" type="submit">GUARDAR RESULTADO</button>`);el('#editorForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);data.results.unshift({id:uid('res'),race:fd.get('race'),date:fd.get('date'),driver:fd.get('driver'),category:fd.get('category'),position:fd.get('position'),time:fd.get('time'),notes:fd.get('notes')});save();go('results')}}
function renderPartners(){view.innerHTML=`<div class="toolbar"><div></div><button class="primary" id="newPartner">+ ADICIONAR PARCEIRO</button></div><div class="card table-wrap"><table><thead><tr><th>Logo</th><th>Nome</th><th>Categoria</th><th>Ordem</th><th>Ativo</th><th></th></tr></thead><tbody>${data.partners.map(p=>`<tr><td><img class="thumb" src="${p.logo}"></td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${p.order}</td><td><span class="status ${p.active?'on':'off'}">${p.active?'ATIVO':'INATIVO'}</span></td><td><button class="ghost" data-edit-partner="${p.id}">EDITAR</button> <button class="danger" data-del-partner="${p.id}">APAGAR</button></td></tr>`).join('')}</tbody></table></div>`;el('#newPartner').onclick=()=>partnerForm();document.querySelectorAll('[data-edit-partner]').forEach(b=>b.onclick=()=>partnerForm(b.dataset.editPartner));document.querySelectorAll('[data-del-partner]').forEach(b=>b.onclick=()=>{if(confirm('Apagar parceiro?')){data.partners=data.partners.filter(x=>x.id!==b.dataset.delPartner);save();renderPartners()}})}
function partnerForm(id){const p=data.partners.find(x=>x.id===id)||{id:uid('p'),name:'',category:'MAIN PARTNER',logo:'assets/logo.jpg',description:'',website:'',instagram:'',facebook:'',order:data.partners.length+1,active:true};view.innerHTML=formShell(id?'Editar parceiro':'Adicionar parceiro',`<div class="form-grid">${formField('Nome','name',p.name)}${formField('Categoria','category',`<option>MAIN PARTNER</option><option>OFFICIAL PARTNER</option><option>SUPPORTER</option>`,'select')}${imageField('Logótipo','logo',p.logo)}${formField('Ordem','order',p.order,'number')}${formField('Website','website',p.website,'url')}${formField('Instagram','instagram',p.instagram,'url')}${formField('Facebook','facebook',p.facebook,'url')}${formField('Descrição','description',p.description,'textarea','full')}<div class="field full"><label class="toggle"><input name="active" type="checkbox" ${p.active?'checked':''}> Parceiro ativo</label></div></div>`,`<button class="ghost" type="button" onclick="go('partners')">CANCELAR</button><button class="primary" type="submit">GUARDAR PARCEIRO</button>`);wireImageUploads();el('#editorForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);const obj={...p,name:fd.get('name'),category:fd.get('category'),logo:fd.get('logo'),order:Number(fd.get('order')||1),website:fd.get('website'),instagram:fd.get('instagram'),facebook:fd.get('facebook'),description:fd.get('description'),active:fd.get('active')==='on'};const ix=data.partners.findIndex(x=>x.id===id);if(ix>=0)data.partners[ix]=obj;else data.partners.push(obj);save();go('partners')}}
function renderNews(){view.innerHTML=`<div class="toolbar"><div></div><button class="primary" id="newNews">+ ADICIONAR NOTÍCIA</button></div><div class="card table-wrap"><table><thead><tr><th>Imagem</th><th>Título</th><th>Data</th><th>Categoria</th><th>Estado</th><th></th></tr></thead><tbody>${data.news.map(n=>`<tr><td><img class="thumb" src="${n.image}"></td><td>${esc(n.title)}</td><td>${datePt(n.date)}</td><td>${esc(n.category)}</td><td><span class="status ${n.published?'on':'off'}">${n.published?'PUBLICADO':'RASCUNHO'}</span></td><td><button class="ghost" data-edit-news="${n.id}">EDITAR</button> <button class="danger" data-del-news="${n.id}">APAGAR</button></td></tr>`).join('')}</tbody></table></div>`;el('#newNews').onclick=()=>newsForm();document.querySelectorAll('[data-edit-news]').forEach(b=>b.onclick=()=>newsForm(b.dataset.editNews));document.querySelectorAll('[data-del-news]').forEach(b=>b.onclick=()=>{if(confirm('Apagar notícia?')){data.news=data.news.filter(x=>x.id!==b.dataset.delNews);save();renderNews()}})}
function newsForm(id){const n=data.news.find(x=>x.id===id)||{id:uid('n'),title:'',image:'assets/rally-02.svg',summary:'',content:'',date:'',category:'Super Cars',published:false};view.innerHTML=formShell(id?'Editar notícia':'Adicionar notícia',`<div class="form-grid">${formField('Título','title',n.title)}${formField('Data','date',n.date,'date')}${imageField('Imagem','image',n.image,'full')}${formField('Categoria','category',`${COMPETITION_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}<option>Fotografia</option><option>Parceiros</option><option>Notícias</option>`,'select')}${formField('Resumo','summary',n.summary,'textarea','full')}${formField('Conteúdo completo','content',n.content,'textarea','full')}<div class="field full"><label class="toggle"><input name="published" type="checkbox" ${n.published?'checked':''}> Publicado</label></div></div>`,`<button class="ghost" type="button" onclick="go('news')">CANCELAR</button><button class="primary" type="submit">GUARDAR NOTÍCIA</button>`);wireImageUploads();el('#editorForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);const obj={...n,title:fd.get('title'),date:fd.get('date'),image:fd.get('image'),category:fd.get('category'),summary:fd.get('summary'),content:fd.get('content'),published:fd.get('published')==='on'};const ix=data.news.findIndex(x=>x.id===id);if(ix>=0)data.news[ix]=obj;else data.news.unshift(obj);save();go('news')}}
function renderTexts(){view.innerHTML=`<div class="card form-card"><form id="textForm"><div class="form-grid">${formField('Nome do site','siteName',data.settings.siteName)}${formField('Email','email',data.settings.email,'email')}${formField('Instagram','instagram',data.settings.instagram,'url')}${formField('Facebook','facebook',data.settings.facebook,'url')}${formField('Localização','location',data.settings.location)}${formField('Hero title','heroTitle',data.settings.heroTitle,'textarea','full')}${formField('Hero subtitle','heroSubtitle',data.settings.heroSubtitle,'textarea','full')}${formField('About','about',data.settings.about,'textarea','full')}${formField('Footer','footer',data.settings.footer,'textarea','full')}</div><div class="form-actions"><button class="primary">GUARDAR TEXTOS</button></div></form></div>`;el('#textForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);['siteName','email','instagram','facebook','location','heroTitle','heroSubtitle','about','footer'].forEach(k=>data.settings[k]=f.get(k));save();alert(cloudMode?'Textos guardados e sincronizados com Cloudflare.':'Textos guardados localmente. A sincronização ficará ativa no site publicado na Cloudflare.')}}
function renderSettings(){view.innerHTML=`<div class="grid-two"><div class="card"><div class="eyebrow">CONFIGURAÇÕES</div><form id="settingsForm"><div class="form-grid">${formField('Nome do site','siteName',data.settings.siteName)}${formField('Email','email',data.settings.email,'email')}${formField('Instagram','instagram',data.settings.instagram,'url')}${formField('Facebook','facebook',data.settings.facebook,'url')}${formField('Localização','location',data.settings.location)}<div class="field full"><div class="dashboard-note"><b>Password do admin:</b> no modo Cloudflare, a password é a variável secreta <code>ADMIN_PASSWORD</code>. Altera-a no Cloudflare para manter a segurança do painel.</div></div></div><div class="form-actions"><button class="primary">GUARDAR CONFIGURAÇÕES</button></div></form></div><div class="card"><div class="eyebrow">NOTA TÉCNICA</div><p style="color:#8a9390;font-size:12px;line-height:1.7">Este projeto é 100% client-side. O conteúdo é guardado no LocalStorage do navegador. Não existe servidor, Node.js ou PHP. O painel está preparado para ser substituído no futuro por uma API/backend sem alterar a estrutura das páginas.</p><p style="color:#6c7572;font-size:10px">A password local não é uma barreira de segurança de servidor; serve para evitar alterações acidentais no navegador onde o site é gerido.</p></div></div>`;el('#settingsForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);['siteName','email','instagram','facebook','location'].forEach(k=>data.settings[k]=f.get(k));save();alert(cloudMode?'Configurações guardadas e sincronizadas com Cloudflare.':'Configurações guardadas localmente.')}}
function renderMessages(){const ms=getMessages();view.innerHTML=`<div class="card"><div class="toolbar"><div class="eyebrow">${ms.length} MENSAGENS</div><button class="danger" id="clearMsgs">APAGAR TODAS</button></div>${ms.map(m=>`<div class="message-row"><div style="display:flex;justify-content:space-between;gap:15px"><div><strong>${esc(m.name)} · ${esc(m.subject)}</strong><div style="color:#10a4a6;font-size:10px">${esc(m.email)}</div></div><small>${new Date(m.date).toLocaleString('pt-PT')}</small></div><p>${esc(m.message)}</p></div>`).join('')||'<div class="empty">Ainda não existem mensagens. Os formulários enviados no website aparecem aqui.</div>'}</div>`;el('#clearMsgs').onclick=async()=>{if(confirm('Apagar todas as mensagens?')){const ok=window.TPCloud?await window.TPCloud.clearMessages():false;if(ok||!cloudMode)localStorage.removeItem(MSG);cloudMessages=[];renderMessages()}}}
async function setup(){
  document.querySelectorAll('.sidebar nav button').forEach(b=>b.onclick=()=>go(b.dataset.view));
  document.querySelector('#logoutBtn').onclick=async()=>{await (window.TPCloud?.logout?.()||Promise.resolve());localStorage.removeItem('telmoAdminLogged');location.reload()};
  try{
    const remote=window.TPCloud?await window.TPCloud.pullData(data):null;
    if(remote){Object.keys(data).forEach(k=>delete data[k]);Object.assign(data,remote);localStorage.setItem(KEY,JSON.stringify(data));cloudMode=true;}
  }catch{}
  try{
    const health=window.TPCloud?await window.TPCloud.checkCloud():{ok:false};
    cloudMode=!!health.ok;
    cloudMessages=cloudMode?await window.TPCloud.pullMessages():getMessages();
    if(document.querySelector('#storageState')) document.querySelector('#storageState').textContent=cloudMode?(health.d1?'Cloudflare + D1 ligado':'Cloudflare ligado · D1 por configurar'):'Modo local / API indisponível';
  }catch{cloudMessages=getMessages();}
  const login=async()=>{
    const pass=document.querySelector('#loginPassword').value;
    let ok=false;
    if(window.TPCloud){try{await window.TPCloud.login(pass);ok=true;cloudMode=true;await window.TPCloud.pushData(data);}catch(e){/* fallback for opening the HTML directly/offline */}}
    if(!ok){const localPass=localStorage.getItem('telmoAdminPass')||'telmo2027';ok=pass===localPass;}
    if(ok){localStorage.setItem('telmoAdminLogged','1');gate.style.display='none';app.style.display='grid';document.querySelector('#storageState').textContent=cloudMode?'Cloudflare ligado':'Modo local';go('dashboard');}
    else{document.querySelector('.login-card p').classList.add('error');document.querySelector('#loginPassword').focus();}
  };
  document.querySelector('#loginBtn').onclick=login;
  document.querySelector('#loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
  let logged=localStorage.getItem('telmoAdminLogged')==='1';
  if(logged){gate.style.display='none';app.style.display='grid';document.querySelector('#storageState').textContent=cloudMode?'Cloudflare ligado':'Modo local';go('dashboard')}else{app.style.display='none'}
  document.querySelector('#resetBtn').onclick=()=>{if(confirm('Isto limpa os dados locais deste navegador. Os dados que estão na Cloudflare não são apagados. Continuar?')){localStorage.removeItem(KEY);localStorage.removeItem(MSG);location.reload()}};
}

setup();window.go=go;
