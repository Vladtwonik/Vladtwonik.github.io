/* Общий код обеих страниц. Данные приходят из инлайн-скрипта: S (съёмки), SITE (контакты), FLORA (цветы), PAGE (режим). */
const N=S.length;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const HOVER=matchMedia('(hover:hover) and (pointer:fine)').matches,CALM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const mod=(a,n)=>((a%n)+n)%n;
const FILM=PAGE.mode=='portrait';

/* contacts */
const waText=FILM?'Здравствуйте! Пишу с сайта по поводу портретной съёмки.':'Здравствуйте! Пишу с сайта по поводу съёмки.';
const waUrl=t=>'https://wa.me/'+SITE.whatsapp+'?text='+encodeURIComponent(t);
if(SITE.whatsapp)$$('.js-wa').forEach(a=>{a.href=waUrl(waText);a.target='_blank';a.rel='noopener'});
else $$('.js-wa').forEach(a=>a.removeAttribute('target'));
if(SITE.telegram)$$('.js-tg').forEach(a=>a.href='https://t.me/'+SITE.telegram);

/* slot-machine letters (не на рукописном шрифте: обрежет росчерки) */
function slot(el){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);
let chs=[];ns.forEach(t=>{const f=document.createElement('span');for(const c of t.textContent){if(/\s/.test(c)){f.append(c);continue}
const s=document.createElement('span');s.className='ch';s.innerHTML='<i></i><i></i>';s.firstChild.textContent=s.lastChild.textContent=c;f.append(s);chs.push(s)}t.replaceWith(f)});
const m=(chs.length-1)/2;chs.forEach((s,i)=>s.style.setProperty('--d',(Math.abs(i-m)*28+Math.random()*70|0)+'ms'));
const host=el.closest('a,button')||el;host.addEventListener('mouseenter',()=>{el.classList.remove('roll');void el.offsetWidth;el.classList.add('roll')})}
if(HOVER&&!CALM)$$('[data-slot]').forEach(slot);

/* pill nav */
const pill=$('#pill');addEventListener('scroll',()=>{pill.classList.toggle('up',scrollY>40);if(scrollY<innerHeight*.5)$$('.pill nav a').forEach(a=>a.classList.remove('on'))},{passive:true});
const navIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('.pill nav a').forEach(a=>a.classList.toggle('on',a.hash=='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
['work','do','about','form'].forEach(id=>{const s=document.getElementById(id);if(s)navIO.observe(s)});
/* переход между страницами — мягкое затухание */
$$('a.js-mode').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey)return;e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>location.href=a.href,CALM?0:380)}));
addEventListener('pageshow',()=>document.body.classList.remove('leaving'));

/* lightbox */
let cs=0,ci=0;const lb=$('#lb'),lbi=$('#lbi'),lbth=$('#lbth');
function openShoot(i){cs=i;$('#lbt').textContent=S[i].name+' :: '+S[i].kind+(S[i].year?' · '+S[i].year:'');lbth.innerHTML='';
S[i].imgs.forEach((im,k)=>{const t=new Image();t.src=im.t;t.alt='';t.onclick=()=>show(k);lbth.appendChild(t)});show(0);lb.classList.add('on');document.body.style.overflow='hidden';$('#peek').classList.remove('on')}
function show(k){const n=S[cs].imgs.length;ci=mod(k,n);lbi.src=S[cs].imgs[ci].f;lbi.style.animation='none';void lbi.offsetHeight;lbi.style.animation='';
$('#lbn').textContent=String(ci+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');[...lbth.children].forEach((t,j)=>t.classList.toggle('on',j==ci));
const nx=new Image();nx.src=S[cs].imgs[mod(ci+1,n)].f}
function closeLb(){lb.classList.remove('on');document.body.style.overflow=''}
$('#lbx').onclick=closeLb;$('#lbl').onclick=()=>show(ci-1);$('#lbr').onclick=()=>show(ci+1);lbi.onclick=()=>show(ci+1);
addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key=='Escape')closeLb();if(e.key=='ArrowRight')show(ci+1);if(e.key=='ArrowLeft')show(ci-1)});
let tx;lb.ontouchstart=e=>tx=e.touches[0].clientX;lb.ontouchend=e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)show(ci+(d<0?1:-1))};

/* infinite grid (fashion: карточки; portrait: вертикальные плёночные ленты) */
(()=>{const view=$('#inf');let tiles=[],tw,th,gx,gy,sx,sy,cols,rows,ox=0,oy=0,vx=0,vy=0,live=false,hov=false,drag=null;
function layout(){const W=view.clientWidth,H=view.clientHeight;const mob=W<760;
if(FILM){tw=mob?W/2.25:Math.min(290,Math.max(190,W/5.4));gx=mob?16:34;gy=0;th=(tw-44)*4/3+24}
else{tw=mob?W/2.35:Math.min(300,Math.max(180,W/5.6));gx=gy=mob?14:24;th=tw*4/3+40}
sx=tw+gx;sy=th+gy;
const c=Math.ceil(W/sx)+2,r=Math.ceil(H/sy)+2;if(c==cols&&r==rows){tiles.forEach(t=>t.el.style.width=tw+'px');return}
cols=c;rows=r;view.innerHTML='';tiles=[];for(let k=0;k<cols*rows;k++){const el=document.createElement('button');el.className='tile';el.type='button';
el.innerHTML='<div class="ph"><img alt="" draggable="false" decoding="async"><span class="edge"></span></div><div class="cap"><b></b><span class="chip"></span><span class="chip"></span></div>';
el.style.width=tw+'px';view.appendChild(el);tiles.push({el,img:el.querySelector('img'),cap:el.querySelectorAll('.cap>*'),edge:el.querySelector('.edge'),idx:-1})}}
function render(){const fx=Math.floor(ox/sx),fy=Math.floor(oy/sy),rx=ox-fx*sx,ry=oy-fy*sy;
tiles.forEach((t,k)=>{const c=k%cols,r=k/cols|0,wc=fx+c-1,wr=fy+r-1;const lift=FILM?mod(wc*37,5)*th*.17:mod(wc,2)*th*.28;
t.el.style.transform=`translate3d(${(c-1)*sx-rx}px,${(r-1)*sy-ry-lift}px,0)`;const idx=mod(wc+wr*5,N);
if(t.idx!==idx){t.idx=idx;const s=S[idx];t.img.src=s.imgs[0].t;t.img.alt=s.name;t.cap[0].textContent=s.name;t.cap[1].textContent=s.kind;t.cap[2].textContent=s.year;
t.edge.textContent=(FILM?'SAFETY FILM 400  ▸ '+String(idx+1).padStart(2,'0')+'A  ·  '+s.kind:'');t.el.setAttribute('aria-label',s.name+', открыть')}})}
function loop(){if(!live)return;if(!drag){ox+=vx;oy+=vy;vx*=.93;vy*=.93;if(!hov&&!CALM&&Math.abs(vx)<.3)FILM?oy+=.3:ox+=.35}render();requestAnimationFrame(loop)}
view.addEventListener('pointerdown',e=>{if(e.button)return;drag={x:e.clientX,y:e.clientY,m:0,t:e.target.closest('.tile'),id:e.pointerId};vx=vy=0});
view.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;drag.m+=Math.abs(dx)+Math.abs(dy);
if(drag.m>6&&!view.classList.contains('drag')){view.classList.add('drag');try{view.setPointerCapture(drag.id)}catch(_){}}
ox-=dx;if(e.pointerType=='mouse')oy-=dy;vx=-dx;vy=e.pointerType=='mouse'?-dy:0});
const end=e=>{if(!drag)return;if(drag.m<=6&&drag.t&&e.type=='pointerup')openShoot(tiles.find(t=>t.el==drag.t).idx);drag=null;view.classList.remove('drag')};
view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
view.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.classList.contains('tile')){e.preventDefault();openShoot(tiles.find(t=>t.el==e.target).idx)}});
view.addEventListener('mouseenter',()=>hov=true);view.addEventListener('mouseleave',()=>hov=false);
view.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){ox+=e.deltaX;e.preventDefault()}},{passive:false});
S.forEach(s=>{const i=new Image();i.src=s.imgs[0].t});
layout();render();addEventListener('resize',()=>{layout();render()});
new IntersectionObserver(([e])=>{const was=live;live=e.isIntersecting;if(live&&!was)requestAnimationFrame(loop)}).observe(view)})();

if(!HOVER){const h=$('.hint');if(h)h.textContent=FILM?'← листайте плёнку вбок · нажмите на кадр →':'← листайте вбок · нажмите на съёмку →'}

/* list view */
(()=>{const list=$('#list'),peek=$('#peek');
list.innerHTML=S.map((s,i)=>`<button class="lrow" data-i="${i}"><span class="mono n">${String(i+1).padStart(2,'0')}</span><img class="th" src="${s.imgs[0].t}" alt="" loading="lazy"><h3 data-slot>${s.name}</h3><span class="mono">${s.kind}</span><span class="mono yr">${s.year||''}</span><span class="mono go">${s.imgs.length} фото →</span></button>`).join('');
$$('.lrow').forEach(r=>{r.onclick=()=>openShoot(+r.dataset.i);if(HOVER&&!CALM)slot(r.querySelector('h3'));
r.addEventListener('mouseenter',()=>{if(!HOVER)return;peek.src=S[r.dataset.i].imgs[0].t;peek.classList.add('on')})});
list.addEventListener('mouseleave',()=>peek.classList.remove('on'));
list.addEventListener('mousemove',e=>{peek.style.left=e.clientX+150+'px';peek.style.top=e.clientY+'px'});
const w=$('#work');const set=v=>{w.classList.toggle('is-list',v=='list');$$('.tog button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));try{localStorage.setItem('view',v)}catch(_){}};
$$('.tog button').forEach(b=>b.onclick=()=>{set(b.dataset.v);dispatchEvent(new Event('resize'))});
try{const v=localStorage.getItem('view');if(v)set(v)}catch(_){}})();

/* засушенные цветы за курсором: изредка появляются и лежат на фоне */
(()=>{if(!HOVER||CALM||!FLORA.length)return;const layer=$('#flora');let acc=0,lx=null,ly=null,live=[];
const SKIP='input,textarea,select,button,a,label,.tile,.card,.lrow,.blank,.letter,.env,.lb,.pill,.inf';
addEventListener('pointermove',e=>{if(e.pointerType!='mouse')return;if(lx!=null)acc+=Math.hypot(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY;
if(acc<230)return;acc=0;if(Math.random()>.55)return;if(e.target.closest&&e.target.closest(SKIP))return;
const im=new Image();im.src=FLORA[Math.random()*FLORA.length|0];im.alt='';im.className='fl';
const s=46+Math.random()*64,r=(Math.random()*80-40)|0;
im.style.cssText=`left:${e.pageX+(Math.random()*40-20)-s/2}px;top:${e.pageY+(Math.random()*40-20)-s/2}px;width:${s}px;--r:${r}deg`;
layer.appendChild(im);live.push(im);
setTimeout(()=>{im.classList.add('out');setTimeout(()=>im.remove(),1600)},6000+Math.random()*5000);
if(live.length>18){const o=live.shift();o.classList.add('out');setTimeout(()=>o.remove(),1600)}
live=live.filter(x=>x.isConnected)},{passive:true});
const fit=()=>layer.style.height=document.documentElement.scrollHeight+'px';fit();addEventListener('resize',fit);addEventListener('load',fit)})();

/* form */
(()=>{const f=$('#bk'),err=$('#err'),btn=f.querySelector('button[type=submit]');
const bn=$('#bn'),bd=$('#bd');if(bn)bn.textContent=String(Date.now()%10000).padStart(4,'0');if(bd)bd.textContent=new Date().toLocaleDateString('ru-RU');
f.addEventListener('submit',async e=>{e.preventDefault();err.style.display='none';
for(const n of['name','contact'])if(!f[n].value.trim()){f[n].focus();f[n].closest('.fld').style.borderBottomColor='var(--acc)';return}
if(f.website.value)return;
const fd=new FormData(f);fd.delete('website');fd.append('source',location.href);
const txt=`Заявка с сайта\nИмя: ${fd.get('name')}\nКонтакт: ${fd.get('contact')}\nСъёмка: ${fd.get('type')}\nДата: ${fd.get('date')||'—'}\n${fd.get('message')||''}`;
if(!SITE.form_endpoint){if(SITE.whatsapp)open(waUrl(txt),'_blank');else{err.textContent='Форма ещё не подключена. Напишите в Instagram @vova_nikitin__.';err.style.display='block';return}f.classList.add('sent');return}
btn.disabled=true;btn.style.opacity=.5;
try{await fetch(SITE.form_endpoint,{method:'POST',mode:'no-cors',body:new URLSearchParams(fd)});f.classList.add('sent');$('#note').textContent=PAGE.sent;f.reset()}
catch(_){err.style.display='block';btn.disabled=false;btn.style.opacity=''}})})();

/* misc */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.rv').forEach(el=>io.observe(el));
const tick=()=>{const t=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Almaty'});$$('.clk').forEach(c=>c.textContent=t)};tick();setInterval(tick,30000);

/* fashion hero: контуры вокруг вырезки */
(()=>{const P=PAGE.paths||[],svg=$('#lines'),fig=$('#fig');if(!P.length||!svg||CALM)return;
svg.setAttribute('viewBox',PAGE.vb);const NS='http://www.w3.org/2000/svg';
const L=P.map((d,i)=>{const e=document.createElementNS(NS,'path');e.setAttribute('d',d);svg.appendChild(e);const len=e.getTotalLength();
return{e,len,pos:Math.random()*len,base:[.32,.24,.18][i],f:.00045+i*.00017,ph:i*2.1,sp:[.55,.42,.34][i]}});
let hov=0,h=0,last=performance.now();fig.addEventListener('mouseenter',()=>hov=1);fig.addEventListener('mouseleave',()=>hov=0);
if(!HOVER){const img=fig.querySelector('img');fig.addEventListener('click',()=>{hov=hov?0:1;img.style.filter=hov?'none':''})}
function tk(t){const dt=Math.min(50,t-last);last=t;h+=(hov-h)*Math.min(1,dt*.0045);
L.forEach(o=>{const wave=Math.sin(t*o.f+o.ph)*.75+Math.sin(t*o.f*2.3+o.ph*1.7)*.35;
o.pos=(o.pos+o.sp*(wave*(1-h)+h*3.2)*dt+o.len)%o.len;const fr=o.base+(1-o.base)*Math.pow(h,1.6),dash=o.len*Math.min(fr,1);
o.e.style.strokeDasharray=fr>=.995?'none':dash+' '+(o.len-dash);o.e.style.strokeDashoffset=-o.pos});requestAnimationFrame(tk)}requestAnimationFrame(tk)})();
