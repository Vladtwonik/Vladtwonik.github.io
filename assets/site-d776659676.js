/* Общий код обеих страниц. Данные приходят из инлайн-скрипта: S (съёмки), SITE (контакты), FLORA (цветы), PAGE (режим). */
const N=S.length;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const HOVER=matchMedia('(hover:hover) and (pointer:fine)').matches,CALM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const mod=(a,n)=>((a%n)+n)%n;
const PORTRAIT=PAGE.mode=='portrait';

/* contacts */
const waText=PORTRAIT?'Здравствуйте! Пишу с сайта по поводу портретной съёмки.':'Здравствуйте! Пишу с сайта по поводу съёмки.';
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
/* Switch between the two real URLs, with a ripple before navigation. */
let modePending = false;
$$('a.js-mode').forEach(link => link.addEventListener('click', event => {
  if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || CALM) return;
  event.preventDefault();
  if (modePending) return;
  modePending = true;
  const root = document.documentElement;
  const box = link.closest('.mode').getBoundingClientRect();
  root.style.setProperty('--mode-x', (box.left + box.width / 2) + 'px');
  root.style.setProperty('--mode-y', (box.bottom - 2) + 'px');
  try { sessionStorage.setItem('landing-mode:' + link.pathname, String(Date.now())); } catch (_) {}
  root.classList.add('mode-leaving');
  setTimeout(() => location.assign(link.href), 140);
}));
addEventListener('pageswap', event => {
  if (!modePending) event.viewTransition?.skipTransition();
});
addEventListener('pageshow', () => {
  modePending = false;
  document.documentElement.classList.remove('mode-leaving');
});

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

/* Infinite gallery */
(()=>{const view=$('#inf');let tiles=[],tw,th,gx,gy,sx,sy,cols,rows,ox=0,oy=0,vx=0,vy=0,live=false,hov=false,drag=null;
function layout(){const W=view.clientWidth,H=view.clientHeight;const mob=W<760;
if(PORTRAIT){tw=mob?W/2.25:Math.min(290,Math.max(190,W/5.4));gx=mob?12:22;gy=mob?12:22;th=tw*4/3}
else{tw=mob?W/2.35:Math.min(300,Math.max(180,W/5.6));gx=gy=mob?14:24;th=tw*4/3+40}
sx=tw+gx;sy=th+gy;
const c=Math.ceil(W/sx)+2,r=Math.ceil(H/sy)+2;if(c==cols&&r==rows){tiles.forEach(t=>t.el.style.width=tw+'px');return}
cols=c;rows=r;view.innerHTML='';tiles=[];for(let k=0;k<cols*rows;k++){const el=document.createElement('button');el.className='tile';el.type='button';
el.innerHTML='<div class="ph"><img alt="" draggable="false" decoding="async"></div><div class="cap"><b></b><span class="chip"></span><span class="chip"></span></div>';
el.style.width=tw+'px';view.appendChild(el);tiles.push({el,img:el.querySelector('img'),cap:el.querySelectorAll('.cap>*'),idx:-1})}}
function render(){const fx=Math.floor(ox/sx),fy=Math.floor(oy/sy),rx=ox-fx*sx,ry=oy-fy*sy;
tiles.forEach((t,k)=>{const c=k%cols,r=k/cols|0,wc=fx+c-1,wr=fy+r-1;const lift=PORTRAIT?mod(wc*37,5)*th*.12:mod(wc,2)*th*.28;
t.el.style.transform=`translate3d(${(c-1)*sx-rx}px,${(r-1)*sy-ry-lift}px,0)`;const idx=mod(wc+wr*5,N);
if(t.idx!==idx){t.idx=idx;const s=S[idx];t.img.src=s.imgs[0].t;t.img.alt=s.name;t.cap[0].textContent=s.name;t.cap[1].textContent=s.kind;t.cap[2].textContent=s.year;
t.el.setAttribute('aria-label',s.name+', открыть')}})}
function loop(){if(!live)return;if(!drag){ox+=vx;oy+=vy;vx*=.93;vy*=.93;if(!hov&&!CALM&&Math.abs(vx)<.3)PORTRAIT?oy+=.3:ox+=.35}render();requestAnimationFrame(loop)}
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

if(!HOVER){const h=$('.hint');if(h)h.textContent=PORTRAIT?'← листайте вбок · нажмите на кадр →':'← листайте вбок · нажмите на съёмку →'}

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

/* Pointer particles belong to the paper layer. */
(() => {
  if (!HOVER || CALM || (PORTRAIT && !FLORA.length)) return;
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = 4;
  const sprites = PORTRAIT ? FLORA.map(src => {
    const image = new Image();
    image.src = src;
    return image;
  }) : [];
  const obstacles = $$('.strip, .pill, header, h1, h2, .meta, .lead, .ctas, .fig, .col, .inf, .list, .hint, .label, .tog, .rows, .desk, .formgrid, footer');
  const skip = 'a, button, form, .lb, .inf, .list';
  const particles = [];
  const random = (min, max) => min + Math.random() * (max - min);
  let frame = 0, width, height, ratio, previous = null, distance = 0;
  let lastFlowers = new Set();

  function resize() {
    width = innerWidth;
    height = innerHeight;
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resize();
  addEventListener('resize', resize, {passive: true});

  function draw(now) {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#e5c5ac';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const progress = (now - p.start) / p.life;
      if (progress >= 1) {
        particles.splice(i, 1);
        continue;
      }
      const travel = 1 - (1 - Math.max(0, progress)) ** 3;
      const x = p.x - scrollX + p.dx * travel;
      const y = p.y - scrollY + p.dy * travel;
      if (x < -100 || x > width + 100 || y < -100 || y > height + 100) continue;
      ctx.globalAlpha = p.alpha * Math.min(1, (1 - progress) * (p.settle ? 4 : 1.6));
      if (p.image) {
        const h = p.size * p.image.naturalHeight / p.image.naturalWidth;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.angle + p.spin * travel);
        ctx.drawImage(p.image, -p.size / 2, -h / 2, p.size, h);
        ctx.restore();
      } else {
        ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
      }
    }
    ctx.globalAlpha = 1;
    if (!PORTRAIT && particles.length) {
      for (const node of obstacles) {
        const rect = node.getBoundingClientRect();
        if (rect.width && rect.height && rect.bottom > 0 && rect.top < height) {
          ctx.clearRect(rect.left - 5, rect.top - 5, rect.width + 10, rect.height + 10);
        }
      }
    }
    if (particles.length) frame = requestAnimationFrame(draw);
  }
  function emit(particle) {
    if (particles.length === 160) particles.shift();
    particles.push({...particle, start: performance.now()});
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function flower(x, y, image, burst, angle = 0) {
    const spread = burst ? random(26, 72) : random(2, 14);
    emit({x, y, image, size: burst ? random(15, 30) : random(32, 59),
      dx: Math.cos(angle) * spread, dy: Math.sin(angle) * spread + (burst ? 8 : 0),
      angle: random(-1, 1), spin: random(-1.7, 1.7), settle: !burst,
      alpha: .92, life: burst ? random(590, 930) : random(6200, 10800)});
  }

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    if (e.target.closest(skip) || lb.classList.contains('on')) {
      previous = null;
      distance = 0;
      return;
    }
    if (previous) distance += Math.hypot(e.clientX - previous.x, e.clientY - previous.y);
    previous = {x: e.clientX, y: e.clientY};
    if (distance < (PORTRAIT ? 230 : 15)) return;
    distance = 0;
    if (PORTRAIT) {
      if (Math.random() > .58) return;
      const ready = sprites.filter(image => image.complete && image.naturalWidth);
      if (ready.length) flower(e.pageX, e.pageY, ready[Math.floor(Math.random() * ready.length)], false, random(0, Math.PI * 2));
    } else {
      for (let i = 0; i < 3; i++) {
        emit({x: e.pageX + random(-17, 17), y: e.pageY + random(-17, 17),
          dx: random(-11, 11), dy: random(-11, 11), alpha: random(.26, .63), life: random(280, 590)});
      }
    }
  }, {passive: true});

  addEventListener('click', e => {
    if (e.pointerType !== 'mouse' || e.target.closest(skip) || lb.classList.contains('on')) return;
    const turn = random(0, Math.PI * 2);
    if (PORTRAIT) {
      const pool = sprites.filter(image => image.complete && image.naturalWidth);
      const count = Math.min(pool.length, Math.random() < .7 ? 4 : 5);
      const burst = new Set();
      for (let i = 0; i < count; i++) {
        const fresh = i === 0 ? pool.filter(image => !lastFlowers.has(image)) : pool;
        const available = fresh.length ? fresh : pool;
        const image = available[Math.floor(Math.random() * available.length)];
        burst.add(image);
        pool.splice(pool.indexOf(image), 1);
        flower(e.pageX, e.pageY, image, true, turn + Math.PI * 2 * i / count + random(-.4, .4));
      }
      lastFlowers = burst;
    } else {
      for (let i = 0; i < 30; i++) {
        const angle = turn + Math.PI * 2 * i / 30 + random(-.12, .12);
        const radius = random(57, 105);
        emit({x: e.pageX + random(-4, 4), y: e.pageY + random(-4, 4),
          dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius,
          alpha: random(.52, .94), life: random(460, 690)});
      }
    }
  });
})();

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

/* The painted keys play a slow phrase with a soft bowed layer and room echo. */
(() => {
  const rail = $('#piano');
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!rail || !Audio) return;

  const whites = [0, 2, 4, 5, 7, 9, 11];
  const phrases = [
    [[57, 62, 65], 1.25], [[65, 64, 62], 1.20],
    [[55, 62], 1.10],     [[60, 64, 67], 1.20],
    [[57, 60, 64], 1.15], [[53, 60, 65], 1.35],
    [[67, 65, 62], 1.25], [[55, 60, 64], 1.05],
    [[62, 60, 57], 1.30], [[57, 64, 69], 1.35],
    [[65, 67, 64], 1.40], [[55, 62, 65], 1.20],
  ];
  let audio, mix, bowWave, tabKey;

  function prepareAudio() {
    audio = new Audio();
    mix = audio.createBiquadFilter();
    mix.type = 'lowpass';
    mix.frequency.value = 1550;
    mix.Q.value = 0;
    const master = audio.createDynamicsCompressor();
    master.threshold.value = -20;
    mix.connect(master).connect(audio.destination);

    const delay = audio.createDelay();
    delay.delayTime.value = .94;
    const damping = audio.createBiquadFilter();
    damping.type = 'lowpass';
    damping.frequency.value = 980;
    damping.Q.value = 0;
    const feedback = audio.createGain();
    feedback.gain.value = .39;
    const wet = audio.createGain();
    wet.gain.value = .31;
    mix.connect(delay).connect(damping);
    damping.connect(feedback).connect(delay);
    damping.connect(wet).connect(master);

    bowWave = audio.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0]),
      new Float32Array([0, 1, .35, .20, .09])
    );
  }

  function voice(start, pitch, level, attack, release) {
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    tone.frequency.value = pitch;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level, start + attack);
    gain.gain.exponentialRampToValueAtTime(level * .38, start + attack + (release - attack) * .30);
    gain.gain.exponentialRampToValueAtTime(.0001, start + release);
    tone.connect(gain).connect(mix);
    return tone;
  }

  function note(start, pitch, strength) {
    const felt = voice(start, pitch, .104 * strength, .18, 2.60);
    const overtone = voice(start, pitch * 2.001, .016 * strength, .12, 1.45);
    const bow = voice(start, pitch, .062 * strength, .66, 3.40);
    bow.setPeriodicWave(bowWave);
    const vibrato = audio.createOscillator();
    const depth = audio.createGain();
    vibrato.frequency.value = 4.8;
    depth.gain.setValueAtTime(0, start);
    depth.gain.linearRampToValueAtTime(8, start + 1.1);
    vibrato.connect(depth).connect(bow.detune);

    felt.start(start);
    felt.stop(start + 2.61);
    overtone.start(start);
    overtone.stop(start + 1.46);
    bow.start(start);
    bow.stop(start + 3.41);
    vibrato.start(start);
    vibrato.stop(start + 3.41);
  }

  async function play(key) {
    try {
      if (!audio) prepareAudio();
      if (audio.state !== 'running') await audio.resume();
    } catch (_) {
      return;
    }

    const [notes, spacing] = phrases[Number(key.dataset.phrase)];
    const shift = Number(key.dataset.shift);
    const time = audio.currentTime + .02;
    notes.forEach((midi, index) => {
      const pitch = 440 * 2 ** ((midi + shift - 69) / 12);
      note(time + index * spacing, pitch, 1 - index * .16);
    });
    if (!CALM) key.animate([{backgroundColor: '#aa674a55'}, {backgroundColor: 'transparent'}], {duration: 490});
  }

  function appendOctave(index) {
    const octave = document.createElement('div');
    octave.className = 'piano-octave';
    function addKey(phrase, boundary) {
      const key = document.createElement('button');
      key.type = 'button';
      key.tabIndex = -1;
      key.dataset.phrase = phrase;
      key.dataset.shift = index % 3 === 1 ? -12 : 0;
      key.setAttribute('aria-label', 'Клавиша ' + (index * 12 + phrase + 1));
      if (boundary) {
        key.className = 'piano-black';
        key.style.top = (boundary / whites.length * 100) + '%';
      }
      octave.appendChild(key);
    }
    whites.forEach((phrase, row) => {
      addKey(phrase);
      if (whites[row + 1] === phrase + 2) addKey(phrase + 1, row + 1);
    });
    rail.appendChild(octave);
  }

  function fit() {
    const octaveHeight = rail.clientWidth < 39 ? 245 : 315;
    const count = Math.max(1, Math.round(rail.clientHeight / octaveHeight));
    while (rail.children.length > count) rail.lastElementChild.remove();
    while (rail.children.length < count) appendOctave(rail.children.length);
    if (!tabKey || !tabKey.isConnected) {
      tabKey = rail.querySelector('button');
      tabKey.tabIndex = 0;
    }
  }

  rail.addEventListener('click', event => {
    const key = event.target.closest('button');
    if (key) play(key);
  });
  rail.addEventListener('focusin', event => {
    tabKey.tabIndex = -1;
    tabKey = event.target;
    tabKey.tabIndex = 0;
  });
  rail.addEventListener('keydown', event => {
    const direction = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}[event.key];
    if (!direction) return;
    event.preventDefault();
    const keys = [...rail.querySelectorAll('button')];
    keys[mod(keys.indexOf(event.target) + direction, keys.length)].focus();
  });

  rail.hidden = false;
  fit();
  new ResizeObserver(fit).observe(rail);
})();

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
