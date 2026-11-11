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
  if(k==='self'&&S.hero)return [HVOICE[S.hero].n,HVOICE[S.hero].c];
  return [k,'#efe6d0'];
}
function say(k,t,passive){
  const p=el('p','ln '+(k==='n'?'n':k==='you'?'you':SK[k]?'sk':k==='phone'?'phone':''));
  if(k==='self'&&S.hero){const v=HVOICE[S.hero];p.className='ln sk hasico self';p.style.setProperty('--c',v.c);sfx.voice('hive',delay);p.append(el('span','ski glyph',v.g))}
  if(SK[k]){p.style.setProperty('--c',SK[k].c);sfx.voice(k,delay);
    if(ART['s_'+k]){const im=el('img','ski');im.src=ART['s_'+k];im.alt='';p.append(im);p.classList.add('hasico')}}
  if(k!=='n'){const [nm,c]=who(k);const s=el('span','sp',nm+(passive?'':' —'));s.style.color=c;p.append(s);
    if(passive)p.append(el('span','ptag','[чутьё '+passive+'] —'))}
  p.append(document.createTextNode(k==='self'?t.split(' / ').join('\n'):t));put(p);
}
function gtime(){const m=Math.max(9*60+12+(S.t||0)*17,(S.f.chatMin||0)+1);S.f.chatMin=m;return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function chatMsg(from,text){
  const tm=gtime();
  if(from==='sys'){put(el('p','chatsys',text));S.chat.push(['sys',text,tm])}
  else{put(vkMsg(from,text,tm,true,true,'inlog'));S.chat.push([from,text,tm]);sfx.chat(delay-260)}
  if(S.chat.length>80)S.chat.splice(0,S.chat.length-80);
}
function vkAva(k){const a=el('span','vkava');if(ART['p_'+k])a.style.backgroundImage='url("'+ART['p_'+k]+'")';
  else{a.textContent=H[k].n[0];a.style.background='linear-gradient(135deg,'+H[k].c[0]+','+H[k].c[1]+')'}return a}
function vkMsg(from,text,tm,showName,showAva,extra){
  const mine=from===S.hero,row=el('div','vkrow'+(mine?' mine':'')+(extra?' '+extra:''));
  if(!mine)row.append(showAva?vkAva(from):el('span','vkava ghost'));
  const b=el('div','vkbub'+(showAva?' tail':''));
  if(showName&&!mine){const nm=el('b','vkname',H[from].n);b.append(nm)}
  const tx=el('span','vktext',text);b.append(tx);
  const t=el('span','vktime',(tm||'')+(mine?'  ✓✓':''));b.append(t);row.append(b);return row}
function chatNode(from,text){return vkMsg(from,text,'',true,true)}
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
function CR(n){if(n>0&&has('fail')&&S.cr>=3){note('Кринж не прилип: ты уже умеешь проваливаться');return}
  if(n>0){S.cr=Math.min(crMax(),S.cr+n);note('+'+n+' кринж в чате ('+S.cr+' из '+crMax()+')',true);sfx.cringe(delay-260)}
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
  if(S.hero&&HLINES[S.hero]){const L=HLINES[S.hero];
    if(S.hero==='misha'){if(S.f.hvq){say('self',S.f.hvq);S.f.hvq=null}if(L[id]&&!S.f['hv_'+id]){S.f['hv_'+id]=1;S.f.hvq=L[id]}}
    else if(L[id]&&!S.f['hv_'+id]){S.f['hv_'+id]=1;say('self',L[id])}}
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
      if(ok||g.red)S.used[key]=1;if(!ok)failed();finish(id,ok?o.ok:o.fail)});
    return}
  let br=o;
  if(o.check){const ch=o.check,[b,labs]=bonus(ch);
    const a=1+Math.floor(Math.random()*6),d=1+Math.floor(Math.random()*6),tot=a+d+b;
    const ok=(a+d===12)||(a+d!==2&&tot>=ch.dc);
    const p=el('p','ln roll '+(ok?'ok':'no'));p.style.animationDelay=delay+'ms';delay+=700;
    for(const v of [a,d])p.append(el('span','die',v));
    p.append(document.createTextNode(SK[ch.sk].n+' +'+skv(ch.sk)+(labs.length?' ('+labs.join(', ')+')':'')+' = '+tot+' против '+ch.dc+' · '+(ok?'успех':'провал')));
    logEl.append(p);G.hit=Math.max(G.hit,.35);sfx.dice(delay-700);sfx[ok?'ok':'fail'](delay-150);banner(ok,ch.sk);
    if(ok||ch.red)S.used[key]=1;else S.locked[key]=b;if(!ok)failed();
    br=ok?o.ok:o.fail}
  finish(id,br);
}
function failed(){S.f.fails=(S.f.fails||0)+1;if(S.f.fails===3)TH('fail')}
function finish(id,br){
  (br.say||[]).forEach(emit);
  if(br.fx)br.fx(S);
  let dest=br.go||id;
  if(S.hero&&S.t>=DAY&&!S.f.night&&!FREE.has(id)&&!Game.scenes[dest].end){S.f.night=1;dest='dusk'}
  go(dest,true);
}

/* ---------- панели ---------- */
let panelOpen=null;
function closePanel(){const b=$('panel');b.hidden=true;b.className='';panelOpen=null;document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'))}
function openPanel(p){
  if(panelOpen===p){closePanel();return}
  panelOpen=p;const box=$('panel');box.hidden=false;box.innerHTML='';box.className='p-'+p;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.p===p));
  const x=el('button','pclose');x.type='button';x.setAttribute('aria-label','Закрыть');x.innerHTML='<span>×</span><small>Esc</small>';x.onclick=closePanel;
  const inner=el('div','pscroll');inner.onclick=ev=>{if(ev.target===inner)closePanel()};
  box.append(inner,x);
  ({skills:pSkills,thoughts:pThoughts,phone:pPhone,menu:pMenu})[p](inner);
  sfx.click();
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
  if(S.hero){const v=HVOICE[S.hero];box.append(el('div','grp','Только у тебя'));const g=el('div','skgrid'),row=el('div','skill');row.style.setProperty('--c',v.c);
    const tx=el('div');tx.append(el('b','',v.n),el('span','',v.d));row.append(el('div','hexv',v.g),tx);g.append(row);box.append(g)}
}
function chips(m){const w=el('span','chips');for(const k in m){const c=el('span','chip'+(m[k]<0?' neg':''),(m[k]>0?'+':'−')+Math.abs(m[k])+' '+SK[k].n);c.style.setProperty('--c',SK[k].c);w.append(c)}return w}
function pThoughts(box){
  S.newTh=0;hud();
  const ids=Object.keys(S.th),cook=ids.filter(i=>S.th[i].state==='cook'),done=ids.filter(i=>S.th[i].state==='done');
  const head=el('div','thhead');head.append(el('h2','','Соты мыслей'),el('p','sub','Мысль кладут в соту и вынашивают. Пока она зреет, она мешает. Когда соту запечатает мёд — мысль станет частью тебя.'));
  box.append(head);
  const wrap=el('div','thwrap');
  /* доска: три рабочие соты в среднем ряду, вокруг запечатанные */
  const board=el('div','hboard');
  const cells=[[-1,0,0],[0,0,1],[1,0,2],[-.5,-1,-1],[.5,-1,-1],[-.5,1,-1],[.5,1,-1]];
  for(const [cx,cy,slot] of cells){const c=el('div','hcell');c.style.setProperty('--x',cx);c.style.setProperty('--y',cy);
    const inn=el('div','hin');c.append(inn);
    if(slot<0){c.classList.add('sealed');inn.append(el('span','seal','⬢'))}
    else{const id=cook[slot];
      if(id){const t=S.th[id],d=THOUGHTS[id],pct=Math.round((1-t.left/d.time)*100);c.classList.add('cook');
        const hn=el('div','honey');hn.style.height=Math.max(8,pct)+'%';inn.append(hn);
        inn.append(el('b','',d.n),el('small','','ещё '+t.left+' '+(t.left===1?'шаг':t.left<5?'шага':'шагов')))}
      else{c.classList.add('free');inn.append(el('small','','свободная сота'))}}
    board.append(c)}
  const side=el('div','hside');side.append(board);
  const stat=el('div','thstat');stat.append(el('div','lbl','Зреет: '+cook.length+' из 3'),el('div','lbl','Усвоено: '+done.length));side.append(stat);
  wrap.append(side);
  const list=el('div','thlist');
  if(!ids.length)list.append(el('p','sub','Пока ни одной мысли. Они появляются из разговоров: прислушивайся к тому, что задевает.'));
  const order={cook:0,known:1,done:2};
  ids.sort((a,b)=>order[S.th[a].state]-order[S.th[b].state]).forEach(id=>{
    const t=S.th[id],d=THOUGHTS[id],card=el('div','thcard st-'+t.state);
    const top=el('div','thtop');const k0=Object.keys(d.fin)[0],ic=el('div','thico');if(ART['s_'+k0])ic.style.backgroundImage='url("'+ART['s_'+k0]+'")';else ic.textContent=SK[k0].g;ic.style.setProperty('--c',SK[k0].c);top.append(ic);
    const tt=el('div');tt.append(el('span','thtag',t.state==='done'?'Усвоена':t.state==='cook'?'Зреет':'Новая мысль'),el('b','',d.n));top.append(tt);card.append(top);
    card.append(el('p','',t.state==='done'?d.a:d.q));
    const fx=el('div','thfx');
    if(t.state==='done'){fx.append(el('span','lbl','Навсегда:'),chips(d.fin));if(d.extra)fx.append(el('span','chip',d.extra))}
    else{fx.append(el('span','lbl',t.state==='cook'?'Пока зреет:':'Пока зреет ('+d.time+' шагов):'),chips(d.tmp));if(t.state==='known')fx.append(el('span','lbl dim','Что будет потом — неизвестно'))}
    card.append(fx);
    if(t.state==='cook'){const bar=el('div','thbar');const i=el('i');i.style.width=Math.round((1-t.left/d.time)*100)+'%';bar.append(i);card.append(bar)}
    if(t.state==='known'){const b=el('button','btn',cook.length<3?'Положить в соту':'Все соты заняты');b.type='button';
      if(cook.length<3)b.onclick=()=>{t.state='cook';t.left=d.time;sfx.thought(0);refresh();panelOpen=null;openPanel('thoughts')};else b.disabled=true;card.append(b)}
    list.append(card)});
  wrap.append(list);box.append(wrap);
}
function pPhone(box){
  const w=el('div','vkwin');
  const hd=el('div','vkhead');const back=el('button','vkback','‹');back.type='button';back.setAttribute('aria-label','Назад');back.onclick=closePanel;
  const ga=el('div','vkgava');Object.keys(H).filter(k=>k!==S.hero).slice(0,4).forEach(k=>ga.append(vkAva(k)));
  const ti=el('div','vktitle');ti.append(el('b','','Кто пчёлок уважает'),el('span','','5 участников'));
  const ic=el('div','vkicons');ic.innerHTML='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg><svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z" opacity="0"/><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';
  hd.append(back,ga,ti,ic);
  const ms=el('div','vkmsgs');ms.append(el('div','vkdate','сегодня'));
  if(!S.chat.length)ms.append(el('p','vksys','Здесь пока тихо. Подозрительно тихо.'));
  S.chat.forEach(([f,t,tm],i)=>{
    if(f==='sys'){ms.append(el('p','vksys',t));return}
    const prev=S.chat[i-1],next=S.chat[i+1];
    ms.append(vkMsg(f,t,tm,!prev||prev[0]!==f,!next||next[0]!==f))});
  const inp=el('div','vkinput');inp.innerHTML='<svg viewBox="0 0 24 24"><path d="M15.5 6.5l-7 7a2 2 0 0 0 2.8 2.8l7.4-7.4a3.5 3.5 0 0 0-5-5L6.3 11.3a5 5 0 0 0 7 7l6.2-6.2"/></svg><div class="vkfield">Напишите сообщение…</div><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
  w.append(hd,ms,inp);box.append(w);
  requestAnimationFrame(()=>{ms.scrollTop=ms.scrollHeight});
}
function slider(label,val,fn){const w=el('label','mm-sl');w.append(el('span','',label));const i=el('input');i.type='range';i.min=0;i.max=100;i.step=5;i.value=val;
  i.oninput=()=>{ainit();fn(+i.value)};w.append(i);return w}
function settingsBox(){const d=el('div','mm-set');
  d.append(slider('Общая громкость',A.muted?0:A.vol,v=>{$('volr').value=v;$('volr').oninput({target:$('volr')})}),
    slider('Музыка',Math.round(A.mvol*100),v=>setBus('mvol',v/100)),slider('Звуки и голоса',Math.round(A.svol*100),v=>setBus('svol',v/100)));
  const r=el('div','mm-sl');r.append(el('span','','Мини-игры'));const seg=el('div','seg3');
  MGD.forEach((n,i)=>{const b=el('button','btn'+(Mini.diff===i?' on':''),n);b.type='button';b.onclick=()=>{Mini.diff=i;try{localStorage.setItem('bees_mgdiff',i)}catch(e){}
    seg.querySelectorAll('.btn').forEach((x,j)=>x.classList.toggle('on',j===i));sfx.click()};seg.append(b)});
  r.append(seg);d.append(r);return d}
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
