/* Мини-игры. Mini.run(описание, уровень навыка, done(успех)). Чем выше уровень, тем легче. */
const BEE="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 30'%3E%3Cellipse cx='16' cy='8' rx='9' ry='5' fill='%23fff' opacity='.75' transform='rotate(-20 16 8)'/%3E%3Cellipse cx='24' cy='8' rx='9' ry='5' fill='%23fff' opacity='.55' transform='rotate(15 24 8)'/%3E%3Cellipse cx='20' cy='18' rx='13' ry='8' fill='%23f6b21a'/%3E%3Cpath d='M15 11v14M22 10.5v15' stroke='%231a0f06' stroke-width='3.5'/%3E%3Ccircle cx='32' cy='17' r='5' fill='%231a0f06'/%3E%3C/svg%3E\")";
const MGD=['Лёгкая','Нормальная','Сложная'];
const Mini={active:false,cur:null,diff:1,
 run(g,skill,done){
  const lvl=skill+[2,0,-2][this.diff];
  const box=$('mg');box.hidden=false;box.innerHTML='';this.active=true;
  const T={dance:['Виляющий танец','Запомни фигуры и повтори их стрелками на клавиатуре или кнопками.'],
    balance:['Бочка','Держи тележку в светлой зоне: стрелки ← → или кнопки. Вода расплёскивается, пока ты вне зоны.'],
    still:['Не дёргайся','Веди указатель за светлым кругом и не выходи из него. Плавно. Пчела чувствует рывки.'],
    rhyme:['Бит','Закончи строчку: в рифму и с уважением. Время идёт.'],
    chess:['Мат в один ход','Белые начинают и ставят мат. Нажми на фигуру, потом на клетку.']}[g.type];
  const card=document.createElement('div');card.className='mgcard';card.style.setProperty('--c',SK[g.sk].c);
  const head=document.createElement('div');head.className='mghead';
  const ic=document.createElement('div');ic.className='mgico';
  if(ART['s_'+g.sk])ic.style.backgroundImage='url("'+ART['s_'+g.sk]+'")';else ic.textContent=SK[g.sk].g;
  const tx=document.createElement('div'),k=document.createElement('div');k.className='lbl';k.textContent=SK[g.sk].n+' '+skill+' · сложность: '+MGD[this.diff].toLowerCase()+(g.red?' · один шанс':'');
  const h=document.createElement('h2');h.textContent=g.title||T[0];
  const p=document.createElement('p');p.className='sub';p.textContent=T[1];
  tx.append(k,h,p);head.append(ic,tx);
  const area=document.createElement('div');area.className='mgarea mg-'+g.type;
  card.append(head,area);box.append(card);
  const stop=[];
  const end=ok=>{if(!this.active)return;this.active=false;stop.forEach(f=>f());this.cur=null;
    area.classList.add(ok?'won':'lost');setTimeout(()=>{box.hidden=true;box.innerHTML='';done(ok)},650)};
  this.cur={type:g.type,end};
  Mini[g.type](area,lvl,end,stop,g,this.cur);
 },

 dance(area,lvl,end,stop,g,cur){
  const A={L:'◀',U:'▲',R:'▶',D:'▼'},K={ArrowLeft:'L',ArrowUp:'U',ArrowRight:'R',ArrowDown:'D'};
  const len=Math.max(4,Math.min(9,9-lvl)),seq=[];const gap=Math.max(380,Math.min(720,650-28*lvl));for(let i=0;i<len;i++)seq.push('LURD'[Math.floor(Math.random()*4)]);
  cur.seq=seq;
  const big=document.createElement('div');big.className='mgbig';big.textContent='…';
  const pips=document.createElement('div');pips.className='mgpips';
  for(let i=0;i<len;i++)pips.append(document.createElement('i'));
  const pad=document.createElement('div');pad.className='mgpad';
  let pos=0,ready=false,i=0;
  const press=d=>{if(!ready)return;
    if(d!==seq[pos]){big.textContent='✕';end(false);return}
    pips.children[pos].className='on';big.textContent=A[d];big.className='mgbig';tone(520+pos*90,.15,'triangle',.1);
    if(++pos>=len)end(true)};
  'LURD'.split('').forEach(d=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=A[d];
    b.setAttribute('aria-label',{L:'влево',U:'вверх',R:'вправо',D:'вниз'}[d]);b.style.gridArea=d;b.onclick=()=>press(d);pad.append(b)});pad.classList.add('cross');
  area.append(big,pips,pad);
  const iv=setInterval(()=>{
    if(i<len){big.textContent=A[seq[i]];big.className='mgbig';void big.offsetWidth;big.className='mgbig pulse d'+seq[i];tone(330+i*60,.2,'sine',.09);i++}
    else{clearInterval(iv);big.textContent='Повтори';big.className='mgbig word';ready=true;cur.ready=true;
      const lim=(len*(.95-.06*Mini.diff)+1.2)*1000,t0=performance.now(),bar=document.createElement('div');bar.className='mgbar';bar.append(document.createElement('i'));area.append(bar);
      const tv=setInterval(()=>{const f=1-(performance.now()-t0)/lim;bar.firstChild.style.width=Math.max(0,f*100)+'%';if(f<=0){clearInterval(tv);if(Mini.active)end(false)}},50);stop.push(()=>clearInterval(tv))}},gap);
  const kd=e=>{if(K[e.key]){e.preventDefault();press(K[e.key])}};
  document.addEventListener('keydown',kd);
  stop.push(()=>{clearInterval(iv);document.removeEventListener('keydown',kd)});
  cur.press=press;
 },

 balance(area,lvl,end,stop,g,cur){
  const zone=Math.max(.13,Math.min(.4,.12+.035*lvl)),amp=Math.max(1.4,Math.min(2.6,2.4-.12*lvl)),dur=11;
  area.innerHTML='<div class="mgtrack"><div class="mgzone" style="left:'+(50-zone*50)+'%;width:'+(zone*100)+'%"></div><div class="mgcart"><div class="barrel"><i></i><i></i></div><div class="wheel"></div></div><div class="mgground"></div></div>'+
   '<div class="mgbars"><span>Вода</span><div class="mgbar"><i id="mgw"></i></div><span>Путь</span><div class="mgbar"><i id="mgp"></i></div></div>';
  const pad=document.createElement('div');pad.className='mgpad';
  let input=0,p=0,v=0,drift=0,dt0=0,water=1,prog=0,last=0,raf;
  [['◀',-1,'влево'],['▶',1,'вправо']].forEach(([t,d,l])=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;b.setAttribute('aria-label',l);
    b.onpointerdown=e=>{e.preventDefault();input=d};b.onpointerup=b.onpointerleave=()=>{if(input===d)input=0};pad.append(b)});
  area.append(pad);
  const cart=area.querySelector('.mgcart'),w=area.querySelector('#mgw'),pr=area.querySelector('#mgp');
  const kd=e=>{if(e.key==='ArrowLeft'){input=-1;e.preventDefault()}if(e.key==='ArrowRight'){input=1;e.preventDefault()}};
  const ku=e=>{if(e.key==='ArrowLeft'&&input===-1)input=0;if(e.key==='ArrowRight'&&input===1)input=0};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  const step=dt=>{dt0+=dt;if(dt0>.7){dt0=0;drift=(Math.random()*2-1)*amp}
    v+=(drift+input*3.4-v*1.3)*dt;p+=v*dt;if(p>1){p=1;v=0}if(p<-1){p=-1;v=0}
    if(Math.abs(p)>zone)water-=dt*.5;else water=Math.min(1,water+dt*.03);prog+=dt/dur;
    return water<=0?false:prog>=1?true:null};
  cur.step=step;cur.state=()=>({p,zone});cur.setInput=x=>{input=x};
  const frame=ts=>{const dt=Math.min(.05,(ts-last)/1000||0);last=ts;const r=step(dt);
    cart.style.left=(50+p*46)+'%';cart.style.transform='translate(-50%,-50%) rotate('+(v*16).toFixed(1)+'deg)';cart.classList.toggle('spill',Math.abs(p)>zone);w.style.width=Math.max(0,water*100)+'%';pr.style.width=Math.min(100,prog*100)+'%';
    if(r!==null){end(r);return}raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
  stop.push(()=>{cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku)});
 },

 still(area,lvl,end,stop,g,cur){
  const r=Math.max(22,Math.min(60,20+6*lvl)),spd=Math.max(.8,Math.min(1.5,1+.1*(4-lvl)));
  area.innerHTML='<div class="mgfield"><div class="mgring" style="width:'+2*r+'px;height:'+2*r+'px"></div><div class="mgbee"></div></div>'+
   '<div class="mgbars"><span>Спокойствие</span><div class="mgbar"><i id="mgc"></i></div><span>Тревога пчелы</span><div class="mgbar bad"><i id="mga"></i></div></div>';
  const f=area.querySelector('.mgfield'),ring=area.querySelector('.mgring'),bee=area.querySelector('.mgbee');
  const c=area.querySelector('#mgc'),a=area.querySelector('#mga');bee.style.backgroundImage=BEE;
  let px=-999,py=-999,t=0,calm=0,alarm=0,last=0,raf,cx=0,cy=0;
  const mv=e=>{const b=f.getBoundingClientRect();px=e.clientX-b.left;py=e.clientY-b.top};
  f.addEventListener('pointermove',mv);f.addEventListener('pointerdown',mv);
  cur.target=()=>{const b=f.getBoundingClientRect();return [b.left+cx,b.top+cy]};
  const frame=ts=>{const dt=Math.min(.05,(ts-last)/1000||0);last=ts;t+=dt;
    const W=f.clientWidth,Hh=f.clientHeight;cx=W/2+W*.3*Math.sin(t*.55*spd);cy=Hh/2+Hh*.24*Math.sin(t*.9*spd+1);
    ring.style.left=cx+'px';ring.style.top=cy+'px';
    bee.style.left=(cx+Math.cos(t*4)*(r+16))+'px';bee.style.top=(cy+Math.sin(t*4)*(r+16))+'px';
    const inside=Math.hypot(px-cx,py-cy)<=r;
    if(inside){calm+=dt/7;alarm=Math.max(0,alarm-dt*.12)}else if(t>1.5)alarm+=dt/1.3;
    ring.classList.toggle('in',inside);
    c.style.width=Math.min(100,calm*100)+'%';a.style.width=Math.min(100,alarm*100)+'%';
    if(alarm>=1){end(false);return}if(calm>=1){end(true);return}raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
  stop.push(()=>cancelAnimationFrame(raf));
 },

 rhyme(area,lvl,end,stop,g,cur){
  const time=Math.max(2.6,Math.min(7,2.8+.55*lvl));let i=0,good=0,left=time,last=0,raf,beat=0;
  const line=document.createElement('div');line.className='mgline';
  const bar=document.createElement('div');bar.className='mgbar';bar.append(document.createElement('i'));
  const list=document.createElement('div');list.className='mglist';
  const score=document.createElement('div');score.className='mgpips';
  g.rounds.forEach(()=>score.append(document.createElement('i')));
  const eq=document.createElement('div');eq.className='mgeq';for(let j=0;j<14;j++){const e=document.createElement('i');e.style.animationDelay=(-j*.13)+'s';eq.append(e)}
  area.append(score,eq,line,bar,list);
  const show=()=>{const rd=g.rounds[i];line.textContent=rd.line;list.innerHTML='';left=time;
    const o=rd.opts.map((x,k)=>[x,Math.random()]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
    cur.buttons=[];
    o.forEach(([t,ok])=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;b.onclick=()=>pick(!!ok);list.append(b);cur.buttons.push([b,!!ok])})};
  const pick=ok=>{score.children[i].className=ok?'on':'off';if(ok){good++;tone(660,.2,'triangle',.1)}else tone(160,.3,'sawtooth',.08);
    if(++i>=g.rounds.length){end(good>=g.rounds.length-(Mini.diff===2?0:1));return}show()};
  const frame=ts=>{const dt=Math.min(.05,(ts-last)/1000||0);last=ts;left-=dt;beat+=dt;
    if(beat>.5){beat=0;noise(.04,.12,0,220);line.classList.remove('pulse');void line.offsetWidth;line.classList.add('pulse')}
    bar.firstChild.style.width=Math.max(0,left/time*100)+'%';
    if(left<=0){pick(false);if(!Mini.active)return}
    raf=requestAnimationFrame(frame)};
  show();raf=requestAnimationFrame(frame);
  stop.push(()=>cancelAnimationFrame(raf));
 },

 chess(area,lvl,end,stop,g,cur){
  // Белые: Ла1, Сc3, Крg1. Чёрные: Крh8, пешки g7, h7. Решение: Ла1–а8, мат.
  const start={a1:'♖',c3:'♗',g1:'♔',h8:'♚',g7:'♟',h7:'♟'},white='♖♗♔';
  let pcs=Object.assign({},start),sel=null,tries=lvl>=5?2:1;const hint=lvl>=2;
  const msg=document.createElement('div');msg.className='mgmsg';msg.textContent='Попыток: '+tries;
  const board=document.createElement('div');board.className='mgboard';
  const sq=(x,y)=>'abcdefgh'[x]+(y+1);
  const moves=from=>{const x=from.charCodeAt(0)-97,y=+from[1]-1,pc=pcs[from],out=[];
    const slide=dirs=>{for(const [dx,dy] of dirs){let nx=x+dx,ny=y+dy;
      while(nx>=0&&nx<8&&ny>=0&&ny<8){const s=sq(nx,ny),o=pcs[s];
        if(o){if(white.indexOf(o)<0&&o!=='♚')out.push(s);break}out.push(s);nx+=dx;ny+=dy}}};
    if(pc==='♖')slide([[1,0],[-1,0],[0,1],[0,-1]]);
    if(pc==='♗')slide([[1,1],[1,-1],[-1,1],[-1,-1]]);
    if(pc==='♔')for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const nx=x+dx,ny=y+dy;
      if((dx||dy)&&nx>=0&&nx<8&&ny>=0&&ny<8){const s=sq(nx,ny);if(!pcs[s]||white.indexOf(pcs[s])<0)out.push(s)}}
    return out};
  const draw=()=>{board.innerHTML='';const tg=sel?moves(sel):[];
    for(let y=7;y>=0;y--)for(let x=0;x<8;x++){const s=sq(x,y),b=document.createElement('button');b.type='button';
      b.className='sq '+((x+y)%2?'lt':'dk')+(s===sel?' sel':'')+(hint&&tg.indexOf(s)>=0?' tg':'');
      b.textContent=pcs[s]||'';b.setAttribute('aria-label',s+(pcs[s]?' '+pcs[s]:''));
      if(pcs[s]&&white.indexOf(pcs[s])<0)b.classList.add('blk');
      b.onclick=()=>click(s);board.append(b)}};
  const click=s=>{
    if(pcs[s]&&white.indexOf(pcs[s])>=0){sel=s;draw();return}
    if(!sel||moves(sel).indexOf(s)<0)return;
    const win=pcs[sel]==='♖'&&s==='a8';pcs[s]=pcs[sel];delete pcs[sel];sel=null;draw();
    if(win){msg.textContent='Мат.';end(true);return}
    if(--tries<=0){msg.textContent='Не мат. Король уходит.';end(false);return}
    msg.textContent='Не мат. Король уходит. Попыток: '+tries;
    const t=setTimeout(()=>{pcs=Object.assign({},start);draw()},900);stop.push(()=>clearTimeout(t))};
  area.append(msg,board);draw();cur.click=click;
 }
};

try{const d=parseInt(localStorage.getItem('bees_mgdiff'),10);if(d>=0&&d<=2)Mini.diff=d}catch(e){}
