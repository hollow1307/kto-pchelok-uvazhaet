/* Движок: сцены, реплики, проверки, мысли, чат, сохранения.
   Сцену добавляет Game.add({id:{...}}), формат описан в README.md. */
const Game={scenes:{},add(o){Object.assign(this.scenes,o)}};
let S,delay=0;
const logEl=$('log');
const SAVE='bees_save_v2';

function fresh(){S={hero:null,r:0,st:0,cr:0,xp:0,pts:0,sk:{},f:{},done:{},seen:{},used:{},locked:{},th:{},ver:{},chat:[],cur:'start',newTh:0,t:0,bg:null,pal:null};
  for(const k in SK)S.sk[k]=2}
function skv(k){let v=S.sk[k];for(const id in S.th){const t=S.th[id],d=THOUGHTS[id];
  const m=t.state==='cook'?d.tmp:t.state==='done'?d.fin:null;if(m&&m[k])v+=m[k]}return Math.max(0,v)}
function has(id){return !!S.th[id]&&S.th[id].state==='done'}
function crMax(){return has('drone')?7:5}
function first(id){return !S.seen[id]}
function nver(){return Object.keys(S.ver).length}
function ndone(){return Object.keys(S.done).length}
function save(){if(!S.hero)return;try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function loadSave(){try{const s=localStorage.getItem(SAVE);if(!s)return null;const o=JSON.parse(s);return o&&o.hero&&Game.scenes[o.cur]?o:null}catch(e){return null}}
function wipe(){try{localStorage.removeItem(SAVE)}catch(e){}}
function adopt(o){fresh();for(const k in o)S[k]=o[k]}

/* ---------- вывод ---------- */
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function put(e,step){e.style.animationDelay=delay+'ms';delay+=step==null?260:step;logEl.append(e)}
function who(k){
  if(k==='you')return ['Ты','var(--acc)'];
  if(SK[k])return [SK[k].n,SK[k].c];
  if(H[k])return [H[k].n+(S.hero===k?' (вчерашний ты)':''),'#efe6d0'];
  if(k==='guard')return ['Стражница','#ffd84a'];
  if(k==='queen')return ['Матка','#f0b93e'];
  if(k==='phone')return ['Телефон','#7CFC9A'];
  return [k,'#efe6d0'];
}
function say(k,t,passive){
  const p=el('p','ln '+(k==='n'?'n':k==='you'?'you':SK[k]?'sk':k==='phone'?'phone':''));
  if(SK[k]){p.style.setProperty('--c',SK[k].c);sfx.voice(k,delay);
    if(ART['s_'+k]){const im=el('img','ski');im.src=ART['s_'+k];im.alt='';p.append(im);p.classList.add('hasico')}}
  if(k!=='n'){const [nm,c]=who(k);const s=el('span','sp',nm+(passive?'':' —'));s.style.color=c;p.append(s);
    if(passive)p.append(el('span','ptag','[чутьё '+passive+'] —'))}
  p.append(document.createTextNode(t));put(p);
}
function chatMsg(from,text){
  if(from==='sys'){put(el('p','chatsys',text));S.chat.push(['sys',text])}
  else{if(from===S.hero){const ks=Object.keys(H).filter(k=>k!==S.hero);from=ks[text.length%ks.length]}
    put(chatNode(from,text));S.chat.push([from,text]);sfx.chat(delay-260)}
  if(S.chat.length>80)S.chat.splice(0,S.chat.length-80);
}
function chatNode(from,text){const d=el('div','chatmsg');const av=el('span','av',H[from].n[0]);
  av.style.setProperty('--a',H[from].c[0]);av.style.setProperty('--b',H[from].c[1]);
  const b=el('div','bub');b.append(el('b','',H[from].n),document.createTextNode(text));d.append(av,b);return d}
/* Реплика: [кто, текст, условие?]. Кто: 'n' рассказчик, 'you', id героя, id навыка,
   'навык>3' — пассивная (нужен уровень 3), 'chat:id' — сообщение в чате, 'chat:sys' — системное. */
function emit(l){
  let [w,t,c]=l;if(c&&!c(S))return;
  if(typeof t==='function')t=t(S);
  t=t.replace(/\{hero\}/g,S.hero?H[S.hero].n:'');
  const m=/^(\w+)>(\d)$/.exec(w);
  if(m){if(skv(m[1])>=+m[2])say(m[1],t,+m[2]);return}
  if(w.indexOf('chat:')===0){chatMsg(w.slice(5),t);return}
  say(w,t);
}
function note(t,bad){const p=el('p','fxn'+(bad?' bad':''),t);put(p)}
function selfGag(id){return S.hero===id?[['n','Странно. Здесь уже кто-то есть, и этот кто-то — ты. Вчерашний. В чате такое называется «переслано».']]:[]}

/* ---------- эффекты (ими пользуются сцены) ---------- */
function R(n){S.r=Math.max(0,S.r+n);note((n>0?'+':'−')+Math.abs(n)+' уважения пчёл',n<0);G.hit=Math.max(G.hit,n>0?.55:.8);sfx.resp(n,delay-260)}
function ST(){S.st++;note('Укус. '+S.st+' из 4',true);G.hit=1;sfx.sting(delay-260);
  const a=$('app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}
function CR(n){if(n>0){S.cr=Math.min(crMax(),S.cr+n);note('+'+n+' кринж в чате ('+S.cr+' из '+crMax()+')',true);sfx.cringe(delay-260)}
  else if(S.cr>0){S.cr=Math.max(0,S.cr+n);note('Кринж отпустил: '+S.cr+' из '+crMax())}}
function XP(n){S.xp+=n;while(S.xp>=100){S.xp-=100;S.pts++;note('Новое очко навыка. Открой «Голову».');sfx.thought(delay-260)}}
function TH(id){if(S.th[id])return;S.th[id]={state:'known'};S.newTh=1;note('Новая мысль: «'+THOUGHTS[id].n+'». Открой «Соты мыслей».');sfx.thought(delay-260)}
function fmtMods(m){return Object.keys(m).map(k=>(m[k]>0?'+':'−')+Math.abs(m[k])+' '+SK[k].n).join(', ')}
function tickThoughts(){for(const id in S.th){const t=S.th[id];if(t.state!=='cook')continue;
  if(--t.left<=0){t.state='done';const d=THOUGHTS[id];const b=el('div','thought');
    b.append(el('b','','Мысль дозрела: '+d.n),document.createTextNode(d.a),el('i','',fmtMods(d.fin)+(d.extra?' · '+d.extra:'')));
    put(b,500);sfx.thought(delay-500);XP(40)}}}

/* ---------- проверки ---------- */
function bonus(ch){let b=skv(ch.sk);const labs=[];for(const [c,v,lab] of ch.mods||[])if(c(S)){b+=v;labs.push((v>0?'+':'−')+Math.abs(v)+' '+lab)}return [b,labs]}
function chance(ch){const [b]=bonus(ch);let c=0;for(let a=1;a<=6;a++)for(let d=1;d<=6;d++){const s=a+d;if(s===12||(s!==2&&s+b>=ch.dc))c++}return Math.round(c/36*100)}
function diff(p){return p>=80?'Легко':p>=55?'Средне':p>=35?'Сложно':p>=15?'Очень сложно':'Почти невозможно'}

/* ---------- сцена ---------- */
const DAY=28;
const FREE=new Set(['title','start','start2','pick','wake','hub','phone','phone2','gate','queen','q_deeds','q_question','q_origin','verdict','dusk']);
let curN=null;
function showPortrait(k){const p=$('portrait');
  if(k&&(H[k]||ART['p_'+k])){p.querySelector('.face').innerHTML=ART['p_'+k]?'<img src="'+ART['p_'+k]+'" alt="">':portrait(k);
    p.querySelector('.nm').textContent=who(k)[0];p.classList.remove('off');p.dataset.k=k}
  else{p.classList.add('off');p.dataset.k=''}}
function showBg(){const b=S.bg&&ART['bg_'+S.bg];
  if(b){$('bgimg').style.backgroundImage='url("'+b+'")';$('scene').classList.add('art')}else $('scene').classList.remove('art');
  if(AFX.set)AFX.set(b?S.bg:null)}
function placePins(){document.querySelectorAll('#pins .pin').forEach(p=>{
  if(p.dataset.ix&&AFX.active){const q=AFX.map(+p.dataset.ix,+p.dataset.iy,true),W=$('scene').clientWidth,hw=p.offsetWidth/2+8;
    p.style.left=Math.max(hw,Math.min(W-hw,q[0]))+'px';p.style.top=q[1]+'px'}
  else{p.style.left=p.dataset.x+'%';p.style.top=p.dataset.y+'%'}})}
addEventListener('resize',placePins);
function artReady(){if(!curN)return;showBg();placePins();if(S.hero)hud();const k=$('portrait').dataset.k;if(k)showPortrait(k)}
function stage(n){curN=n;
  if(n.place){$('psub').textContent=n.place[0];$('ptitle').innerHTML='';
    [...n.place[1]].forEach((ch,i)=>{const s=el('span','',ch);s.style.setProperty('--i',i);$('ptitle').append(s)})}
  if(n.pal)S.pal=n.pal;
  const P=PAL[n.pal];
  if(n.pal)MUSIC.set(n.pal);
  if(P){sfx.root(n.pal);G.tg=P.slice(0,4).map(rgb);G.kalT=P[4];
    document.documentElement.style.setProperty('--acc',P[2]);document.documentElement.style.setProperty('--acc2',P[3]);
    $('lid').setAttribute('fill',P[1])}
  if(n.bg)S.bg=n.bg;showBg();
  if('npc' in n||n.end)showPortrait(n.npc);
}
function hud(){
  $('resp').textContent=S.r;
  const top=typeof TOP==='number'?TOP:24;
  $('medal').style.setProperty('--fill',Math.min(100,S.r/top*100)+'%');
  $('respgoal').textContent=S.r>=top?'достойно Матки':'цель: '+top;
  $('stings').innerHTML=Array.from({length:4},(_,i)=>'<i class="'+(i<S.st?'on':'')+'"></i>').join('');
  $('cringe').innerHTML=Array.from({length:crMax()},(_,i)=>'<i class="'+(i<S.cr?'on':'')+'"></i>').join('');
  $('stings').setAttribute('aria-label','Укусов: '+S.st+' из 4');$('cringe').setAttribute('aria-label','Кринж: '+S.cr+' из '+crMax());
  $('xpbar').firstChild.style.width=S.xp+'%';
  const left=Math.max(0,1-S.t/DAY);$('daysun').style.left=Math.min(100,S.t/DAY*100)+'%';
  $('daylbl').textContent=left>.66?'День · утро':left>.33?'День · полдень':left>0?'День · вечереет':'Ночь';
  $('whoname').textContent=S.hero?H[S.hero].n:'Пасека «Жужжащий Яр»';$('whosub').textContent=S.hero?'Ты в чате':'Кто пчёлок уважает';
  const wi=$('whoimg');if(S.hero&&ART['p_'+S.hero]){wi.style.backgroundImage='url("'+ART['p_'+S.hero]+'")';wi.classList.add('on')}else wi.classList.remove('on');
  badge('skills',S.pts);badge('thoughts',S.newTh?'!':0);
  G.tripT=Math.min(1.25,.2+S.r/28+S.st*.13+S.cr*.05);sfx.trip(G.tripT);
  G.duskT=S.pal==='queen'||S.pal==='e_top'?0:Math.max(0,Math.min(.8,(S.t/DAY-.45)*1.5));
}
function badge(p,v){const t=document.querySelector('.tab[data-p="'+p+'"]');let b=t.querySelector('.bdg');
  if(!v){if(b)b.remove();return}if(!b){b=el('span','bdg');t.append(b)}b.textContent=v}
function banner(ok,sk){const b=$('banner');b.textContent=ok?'Успех':'Провал';b.style.color=ok?SK[sk].c:'#ff4d4d';
  b.classList.remove('show');void b.offsetWidth;b.classList.add('show')}
function optList(id){const n=Game.scenes[id];
  if(n.end)return [{t:'Проснуться в клевере заново.',act(){wipe();fresh();logEl.innerHTML='';go('start')}},{t:'В главное меню.',act(){showMenu()}}];
  if(S.hero&&S.st>=4)return [{t:'Потрогать лицо.',go:'swollen'}];
  if(S.hero&&S.cr>=crMax())return [{t:'Достать телефон дрожащей рукой.',go:'leftchat'}];
  const o=typeof n.opts==='function'?n.opts(S):n.opts||[];
  return o.filter(o=>(!o.if||o.if(S))&&!S.used[id+':'+o.t]&&(!o.need||skv(o.need[0])>=o.need[1]))}
function renderOpts(id){
  const old=$('opts');if(old)old.remove();$('pins').innerHTML='';$('picker').innerHTML='';
  const box=el('div');box.id='opts';
  optList(id).forEach((o,i)=>{
    const b=el('button','opt');b.type='button';b.dataset.n=i+1;b.style.animationDelay=(delay+i*90)+'ms';
    const key=id+':'+o.t;let locked=false;
    if(o.need){const c=el('span','ck',SK[o.need[0]].n);c.style.color=SK[o.need[0]].c;b.append(c)}
    if(o.check){const ch=o.check,p=chance(ch),c=el('span','ck'+(ch.red?' red':''));
      locked=!ch.red&&key in S.locked&&bonus(ch)[0]<=S.locked[key];
      c.style.color=SK[ch.sk].c;c.textContent=SK[ch.sk].n+' · '+(locked?'провалено, нужен навык выше':diff(p)+' '+p+'%'+(ch.red?' · один шанс':''));b.append(c)}
    if(o.game){const c=el('span','ck'+(o.game.red?' red':''),SK[o.game.sk].n+' · мини-игра'+(o.game.red?' · один шанс':''));c.style.color=SK[o.game.sk].c;b.append(c)}
    b.append(document.createTextNode(o.t));
    if(locked){b.classList.add('locked');b.setAttribute('aria-disabled','true')}else b.onclick=()=>choose(id,o);
    box.append(b);
    if(o.hero){const c=el('button','pcard');c.type='button';c.style.animationDelay=(i*90)+'ms';
      if(ART['p_'+o.hero]){const im=el('img');im.src=ART['p_'+o.hero];im.alt='';c.append(im)}else{const d=el('div','psvg');d.innerHTML=portrait(o.hero);c.append(d)}
      c.append(el('b','',H[o.hero].n),el('span','',H[o.hero].d));c.onclick=()=>choose(id,o);$('picker').append(c)}
    if(o.pin&&!locked){const p=el('button','pin');p.type='button';const ico=el('i','pico');ico.append(el('i'));p.append(ico,el('span','',o.pin[2]));
      if(o.pin[5]&&ART['bg_'+o.pin[5]]){p.classList.add('thumb');p.style.setProperty('--img','url("'+ART['bg_'+o.pin[5]]+'")')}p.dataset.x=o.pin[0];p.dataset.y=o.pin[1];if(o.pin[3]!=null){p.dataset.ix=o.pin[3];p.dataset.iy=o.pin[4]}
      p.style.animationDelay=(delay+i*90)+'ms';p.onclick=()=>choose(id,o);$('pins').append(p)}});
  logEl.append(box);placePins();
  requestAnimationFrame(()=>{logEl.scrollTop=logEl.scrollHeight});
  setTimeout(()=>{logEl.scrollTop=logEl.scrollHeight},delay+450);
}
function go(id,keep){
  const n=Game.scenes[id];if(!n){note('Сцена не найдена: '+id,true);return}
  if(!keep)delay=0;
  S.cur=id;
  if(n.enter)n.enter(S);
  stage(n);
  if(n.end)logEl.append(el('div','sep'));
  (typeof n.text==='function'?n.text(S):n.text||[]).forEach(emit);
  S.seen[id]=(S.seen[id]||0)+1;
  if(!n.end)tickThoughts();
  if(n.end){const h=el('p','end ln','Финал: '+n.end);sfx.end(n.pal,delay);put(h,300);
    note('Уважение пчёл: '+S.r+' · укусов: '+S.st+' · кринж: '+S.cr);wipe()}
  hud();if(!n.end)save();
  renderOpts(id);
}
function choose(id,o){
  if(Mini.active)return;
  const old=$('opts');if(old)old.remove();$('pins').innerHTML='';$('picker').innerHTML='';
  sfx.click();
  if(o.act){o.act();return}
  delay=0;const key=id+':'+o.t;
  if(o.once)S.used[key]=1;
  if(S.hero&&!FREE.has(id)&&!o.free&&o.go!=='hub')S.t++;
  say('you',o.t);
  if(o.game){const g=o.game;
    Mini.run(g,bonus(g)[0],ok=>{delay=0;banner(ok,g.sk);sfx[ok?'ok':'fail'](0);
      note(SK[g.sk].n+' · мини-игра · '+(ok?'успех':'провал'),!ok);
      if(ok||g.red)S.used[key]=1;finish(id,ok?o.ok:o.fail)});
    return}
  let br=o;
  if(o.check){const ch=o.check,[b,labs]=bonus(ch);
    const a=1+Math.floor(Math.random()*6),d=1+Math.floor(Math.random()*6),tot=a+d+b;
    const ok=(a+d===12)||(a+d!==2&&tot>=ch.dc);
    const p=el('p','ln roll '+(ok?'ok':'no'));p.style.animationDelay=delay+'ms';delay+=700;
    for(const v of [a,d])p.append(el('span','die',v));
    p.append(document.createTextNode(SK[ch.sk].n+' +'+skv(ch.sk)+(labs.length?' ('+labs.join(', ')+')':'')+' = '+tot+' против '+ch.dc+' · '+(ok?'успех':'провал')));
    logEl.append(p);G.hit=Math.max(G.hit,.35);sfx.dice(delay-700);sfx[ok?'ok':'fail'](delay-150);banner(ok,ch.sk);
    if(ok||ch.red)S.used[key]=1;else S.locked[key]=b;
    br=ok?o.ok:o.fail}
  finish(id,br);
}
function finish(id,br){
  (br.say||[]).forEach(emit);
  if(br.fx)br.fx(S);
  let dest=br.go||id;
  if(S.hero&&S.t>=DAY&&!S.f.night&&!FREE.has(id)&&!Game.scenes[dest].end){S.f.night=1;dest='dusk'}
  go(dest,true);
}

/* ---------- панели ---------- */
let panelOpen=null;
function closePanel(){$('panel').hidden=true;panelOpen=null;document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'))}
function openPanel(p){
  if(panelOpen===p){closePanel();return}
  panelOpen=p;const box=$('panel');box.hidden=false;box.innerHTML='';box.scrollTop=0;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.p===p));
  const x=el('button','btn x','Закрыть');x.type='button';x.onclick=closePanel;box.append(x);
  ({skills:pSkills,thoughts:pThoughts,phone:pPhone,menu:pMenu})[p](box);
}
function refresh(){hud();save();if(Game.scenes[S.cur]&&!Game.scenes[S.cur].end){delay=0;renderOpts(S.cur)}}
function pSkills(box){
  box.append(el('h2','','Голова'),el('p','sub',S.hero?'Восемь голосов. Чем выше навык, тем чаще голос встревает сам — и тем увереннее даёт советы, в том числе плохие. Свободных очков: '+S.pts+'.':'Сначала вспомни, кто ты.'));
  for(const [g,ks] of GROUPS){box.append(el('div','grp',g));const grid=el('div','skgrid');
    for(const k of ks){const d=SK[k],row=el('div','skill');row.style.setProperty('--c',d.c);
      const v=skv(k),diffv=v-S.sk[k];
      const txt=el('div');txt.append(el('b','',d.n+(diffv?' ('+(diffv>0?'+':'−')+Math.abs(diffv)+' от мыслей)':'')),el('span','',d.d));
      const hx=el('div','hexv',v);if(ART['s_'+k]){hx.style.backgroundImage='url("'+ART['s_'+k]+'")';hx.classList.add('art')}row.append(hx,txt);
      if(S.hero&&S.pts>0&&S.sk[k]<6){const b=el('button','plus','+');b.type='button';b.setAttribute('aria-label','Повысить: '+d.n);
        b.onclick=()=>{S.pts--;S.sk[k]++;sfx.ok(0);refresh();panelOpen=null;openPanel('skills')};row.append(b)}
      grid.append(row)}
    box.append(grid)}
}
function pThoughts(box){
  S.newTh=0;hud();
  box.append(el('h2','','Соты мыслей'),el('p','sub','Мысль можно положить в ячейку и вынашивать. Пока она зреет, она мешает. Когда дозреет — меняет тебя навсегда. Ячеек три.'));
  const ids=Object.keys(S.th),cook=ids.filter(i=>S.th[i].state==='cook');
  const slots=el('div','slots');
  for(let i=0;i<3;i++){const id=cook[i],s=el('div','slot'+(id?' cook':''));
    if(id){const w=el('div','',THOUGHTS[id].n);w.append(el('small','','ещё шагов: '+S.th[id].left));s.append(w)}else s.textContent='пусто';slots.append(s)}
  box.append(slots);
  if(!ids.length)box.append(el('p','sub','Пока ни одной мысли. Они появляются из разговоров.'));
  for(const id of ids){const t=S.th[id],d=THOUGHTS[id],c=el('div','th'+(t.state==='done'?' done':''));
    c.append(el('b','',d.n),el('p','',t.state==='done'?d.a:d.q));
    c.append(el('em','',t.state==='done'?'Итог: '+fmtMods(d.fin)+(d.extra?' · '+d.extra:''):
      t.state==='cook'?'Зреет. Пока зреет: '+fmtMods(d.tmp)+'. Осталось шагов: '+t.left:'Пока зреет ('+d.time+' шагов): '+fmtMods(d.tmp)+'. Что будет потом — неизвестно.'));
    if(t.state==='known'&&cook.length<3){const b=el('button','btn','Положить в соту');b.type='button';
      b.onclick=()=>{t.state='cook';t.left=d.time;sfx.thought(0);refresh();panelOpen=null;openPanel('thoughts')};c.append(el('br'),b)}
    box.append(c)}
}
function pPhone(box){
  box.append(el('h2','','Чат'),el('p','sub','«Кто пчёлок уважает» · 5 участников · 0 пчёл'));
  if(!S.chat.length)box.append(el('p','sub','Тихо. Подозрительно тихо.'));
  for(const [f,t] of S.chat)box.append(f==='sys'?el('p','chatsys',t):chatNode(f,t));
}
function slider(label,val,fn){const w=el('label','mm-sl');w.append(el('span','',label));const i=el('input');i.type='range';i.min=0;i.max=100;i.step=5;i.value=val;
  i.oninput=()=>{ainit();fn(+i.value)};w.append(i);return w}
function settingsBox(){const d=el('div','mm-set');
  d.append(slider('Общая громкость',A.muted?0:A.vol,v=>{$('volr').value=v;$('volr').oninput({target:$('volr')})}),
    slider('Музыка',Math.round(A.mvol*100),v=>setBus('mvol',v/100)),slider('Звуки и голоса',Math.round(A.svol*100),v=>setBus('svol',v/100)));return d}
function pMenu(box){
  box.append(el('h2','','Меню'),el('p','sub','Игра сохраняется сама в этом браузере. Код ниже переносит прогресс на другое устройство.'));
  box.append(el('div','grp','Звук'),settingsBox(),el('div','grp','Сохранение'));
  const code=el('textarea');code.readOnly=true;code.setAttribute('aria-label','Код сохранения');
  try{code.value=S.hero?btoa(unescape(encodeURIComponent(JSON.stringify(S)))):''}catch(e){code.value=''}
  const cp=el('button','btn','Скопировать код');cp.type='button';
  cp.onclick=()=>{code.select();try{navigator.clipboard.writeText(code.value).then(()=>cp.textContent='Скопировано',()=>cp.textContent='Выдели и скопируй вручную')}catch(e){cp.textContent='Выдели и скопируй вручную'}};
  const inp=el('textarea');inp.placeholder='Вставь сюда код сохранения';inp.setAttribute('aria-label','Вставить код сохранения');
  const ld=el('button','btn','Загрузить из кода');ld.type='button';
  ld.onclick=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob(inp.value.trim()))));
    if(!o.hero||!Game.scenes[o.cur])throw 0;adopt(o);closePanel();logEl.innerHTML='';note('Игра загружена.');go(S.cur,true)}catch(e){ld.textContent='Код не подошёл'}};
  const mm=el('button','btn','В главное меню');mm.type='button';mm.onclick=()=>{closePanel();showMenu()};
  box.append(code,cp,inp,ld,el('div','grp','Выход'),mm);
}
/* ---------- главное меню ---------- */
function hideMenu(){$('app').classList.remove('menu');$('mainmenu').innerHTML=''}
function showMenu(){
  const m=$('mainmenu');m.innerHTML='';$('app').classList.add('menu');closePanel();
  S.bg='hub';stage({pal:'start',bg:'hub',npc:null});G.duskT=0;
  const sv=loadSave();
  const logo=el('div','mm-logo');logo.append(el('span','','Кто пчёлок'),el('span','acc','уважает'));
  const list=el('div','mm-list'),sub=el('div','mm-sub');
  const btn=(t,fn,cls)=>{const b=el('button','mm-btn'+(cls?' '+cls:''),t);b.type='button';b.onclick=()=>{sfx.click();fn()};list.append(b);return b};
  if(sv)btn('Продолжить',()=>{adopt(sv);hideMenu();logEl.innerHTML='';note('Игра загружена.');go(S.cur,true)}).append(el('small','',H[sv.hero].n+' · уважение '+sv.r));
  let sure=false;
  const ng=btn('Новая игра',()=>{if(sv&&!sure){sure=true;ng.firstChild.textContent='Точно? Сохранение сотрётся';return}
    wipe();fresh();hideMenu();logEl.innerHTML='';go('start')});
  btn('Настройки',()=>{sub.innerHTML='';sub.append(settingsBox())});
  btn('Как играть',()=>{sub.innerHTML='';
    ['Ты — один из пятерых из чата. Цель — заслужить уважение пчёл до вечера и предстать перед Маткой.',
     'Выбирай ответы мышью или цифрами 1–9. По меткам на картине тоже можно кликать.',
     'В голове восемь голосов. Чем выше навык, тем чаще голос встревает. Некоторые советуют плохое.',
     'День не резиновый: на всё времени не хватит. Четыре укуса или полный кринж в чате — конец.',
     'Мысли из разговоров кладутся в «Соты» и со временем меняют тебя.'].forEach(t=>sub.append(el('p','',t)))});
  m.append(el('div','lbl mm-kick','чат · 5 участников · 0 пчёл'),logo,el('p','mm-tag','Психоделическая RPG про пасеку, чат и сорок тысяч свидетельниц'),list,sub);
}
document.querySelectorAll('.tab[data-p]').forEach(t=>t.onclick=()=>openPanel(t.dataset.p));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&panelOpen){closePanel();return}
  if(e.target&&e.target.tagName==='TEXTAREA')return;
  if(Mini.active)return;const n=+e.key;if(n>=1&&n<=9&&!panelOpen){const b=document.querySelector('#opts .opt:nth-child('+n+')');if(b)b.click()}});
