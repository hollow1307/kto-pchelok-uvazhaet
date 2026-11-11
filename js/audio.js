/* ---------- звук (синтез, без файлов) ---------- */
const A={ctx:null,muted:false};
try{A.muted=localStorage.getItem('bees_mute')==='1'}catch(e){}
const ROOT={start:110,hub:110,pick:103.8,k1:98,b1:82.4,y1:110,i1:123.5,m1:73.4,gate:87.3,queen:65.4,e_top:130.8,e_mid:110,e_low:49,swollen:46.2,chat:55};
function ainit(){
  if(A.ctx){if(A.ctx.state==='suspended')A.ctx.resume();return}
  try{const C=window.AudioContext||window.webkitAudioContext;A.ctx=new C()}catch(e){A.ctx=null;return}
  const c=A.ctx;
  A.master=c.createGain();A.master.gain.value=avol();
  A.sfxBus=c.createGain();A.sfxBus.gain.value=A.svol;A.sfxBus.connect(A.master);
  A.musBus=c.createGain();A.musBus.gain.value=A.mvol;A.musBus.connect(A.master);
  A.mfx=c.createGain();A.mfx.gain.value=.5;const md=c.createDelay(1);md.delayTime.value=.42;const mf=c.createGain();mf.gain.value=.38;
  const ml=c.createBiquadFilter();ml.type='lowpass';ml.frequency.value=2200;A.mfx.connect(md);md.connect(ml);ml.connect(mf);mf.connect(md);ml.connect(A.musBus);
  const comp=c.createDynamicsCompressor();A.master.connect(comp);comp.connect(c.destination);
  A.fx=c.createGain();A.fx.connect(A.sfxBus);
  const dl=c.createDelay(1);dl.delayTime.value=.31;const fb=c.createGain();fb.gain.value=.42;
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1800;
  A.fx.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(A.sfxBus);
  // дрон
  A.filt=c.createBiquadFilter();A.filt.type='lowpass';A.filt.frequency.value=420;A.filt.Q.value=6;
  const dg=c.createGain();dg.gain.value=0;/* постоянный гул отключён: играет музыка */
  A.filt.connect(dg);dg.connect(A.sfxBus);dg.connect(A.fx);
  A.dr=[[1,'sawtooth',-7],[1.498,'sawtooth',6],[2,'triangle',-4],[.5,'sine',0]].map(([m,t,d])=>{
    const o=c.createOscillator();o.type=t;o.frequency.value=110*m;o.detune.value=d;o.connect(A.filt);o.start();return [o,m]});
  const lfo=c.createOscillator();lfo.frequency.value=.07;const lg=c.createGain();lg.gain.value=260;
  lfo.connect(lg);lg.connect(A.filt.frequency);lfo.start();
  // рой
  const bz=c.createOscillator();bz.type='sawtooth';bz.frequency.value=205;
  const wob=c.createOscillator();wob.frequency.value=.33;const wg=c.createGain();wg.gain.value=28;wob.connect(wg);wg.connect(bz.frequency);wob.start();
  const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=950;bp.Q.value=1.2;
  const am=c.createGain();am.gain.value=.5;const fl=c.createOscillator();fl.frequency.value=24;const fg=c.createGain();fg.gain.value=.5;
  fl.connect(fg);fg.connect(am.gain);fl.start();
  A.buzz=c.createGain();A.buzz.gain.value=0;
  bz.connect(bp);bp.connect(am);am.connect(A.buzz);
  if(c.createStereoPanner){const pn=c.createStereoPanner();const pl=c.createOscillator();pl.frequency.value=.11;pl.connect(pn.pan);pl.start();A.buzz.connect(pn);pn.connect(A.sfxBus)}
  else A.buzz.connect(A.sfxBus);
  bz.start();
  if(A.rootId)sfx.root(A.rootId);
  if(typeof MUSIC!=='undefined')MUSIC.start();
}
function tone(f,dur,type,vol,ms,to){const c=A.ctx;if(!c)return;const t=c.currentTime+(ms||0)/1000;
  const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(A.sfxBus);g.connect(A.fx);o.start(t);o.stop(t+dur+.05)}
function noise(dur,vol,ms,fq){const c=A.ctx;if(!c)return;const t=c.currentTime+(ms||0)/1000;
  const n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=fq||2500;f.Q.value=2;
  const g=c.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(A.sfxBus);s.start(t)}
const sfx={
  root(id){A.rootId=id;A.buzzOn=id==='m1'||id==='gate'||id==='queen';if(!A.ctx||!ROOT[id])return;const t=A.ctx.currentTime;
    A.dr.forEach(([o,m])=>o.frequency.setTargetAtTime(ROOT[id]*m,t,1.2))},
  trip(v){if(A.ctx){A.filt.frequency.setTargetAtTime(380+1100*v,A.ctx.currentTime,2);A.buzz.gain.setTargetAtTime(A.buzzOn?.012+.02*v:0,A.ctx.currentTime,1.5)}},
  click(){tone(620,.09,'triangle',.12);tone(930,.06,'sine',.05,30)},
  voice(k,ms){({log:()=>{tone(1318,.25,'sine',.06,ms);tone(1976,.3,'sine',.035,ms+70)},
    heart:()=>{tone(392,.6,'sine',.08,ms);tone(587,.7,'sine',.05,ms+90)},
    chit:()=>{tone(82,.35,'square',.07,ms,60);noise(.08,.05,ms,300)},
    wag:()=>{for(let i=0;i<4;i++)tone(i%2?988:880,.07,'triangle',.06,ms+i*60)}})[k]()},
  dice(ms){for(let i=0;i<7;i++)noise(.04,.22,ms+i*70+Math.random()*30,1800+Math.random()*2500)},
  ok(ms){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.5,'triangle',.11,ms+i*85))},
  fail(ms){tone(311,.5,'sawtooth',.09,ms,150);tone(294,.6,'sawtooth',.07,ms+60,104)},
  sting(ms){tone(2400,.28,'sawtooth',.16,ms,160);noise(.25,.3,ms,3500);tone(70,.4,'sine',.25,ms+40,35)},
  resp(n,ms){if(n>0){[880,1320,1760].forEach((f,i)=>tone(f,1.1,'sine',.07,ms+i*40));tone(220,.6,'sine',.08,ms)}
    else tone(196,.6,'triangle',.1,ms,98)},
  end(id,ms){const ch={e_top:[262,330,392,523,659,784],e_mid:[220,277,330,440],e_low:[196,233,277],swollen:[98,104,147]}[id]||[];
    ch.forEach((f,i)=>tone(f,3,id==='e_top'?'triangle':'sawtooth',.07,ms+i*140))}
};
['pointerdown','keydown'].forEach(e=>document.addEventListener(e,ainit));
A.vol=80;try{const v=parseInt(localStorage.getItem('bees_vol'),10);if(v>=0&&v<=100)A.vol=v}catch(e){}
A.mvol=.7;A.svol=.9;try{const m=parseFloat(localStorage.getItem('bees_mvol')),s=parseFloat(localStorage.getItem('bees_svol'));if(m>=0&&m<=1)A.mvol=m;if(s>=0&&s<=1)A.svol=s}catch(e){}
function avol(){return A.muted?0:A.vol/100}
function setBus(which,v){A[which]=v;try{localStorage.setItem(which==='mvol'?'bees_mvol':'bees_svol',v)}catch(e){}
  if(A.ctx)(which==='mvol'?A.musBus:A.sfxBus).gain.setTargetAtTime(v,A.ctx.currentTime,.05)}
$('volr').value=A.vol;
$('volr').oninput=e=>{A.vol=+e.target.value;A.muted=A.vol===0;
  try{localStorage.setItem('bees_vol',A.vol);localStorage.setItem('bees_mute',A.muted?'1':'0')}catch(err){}
  ainit();if(A.ctx)A.master.gain.setTargetAtTime(avol(),A.ctx.currentTime,.05);sndLabel()};
$('volr').onchange=()=>{if(!A.muted)tone(660,.15,'triangle',.12)};
function sndLabel(){$('volv').textContent=A.muted?'0':A.vol;$('snd').textContent=A.muted?'🔇':'🔊';$('snd').setAttribute('aria-pressed',String(!A.muted));$('snd').setAttribute('aria-label',A.muted?'Включить звук':'Выключить звук')}
$('snd').onclick=()=>{A.muted=!A.muted;if(!A.muted&&A.vol===0){A.vol=50;$('volr').value=50;try{localStorage.setItem('bees_vol',50)}catch(e){}}try{localStorage.setItem('bees_mute',A.muted?'1':'0')}catch(e){}
  ainit();if(A.ctx)A.master.gain.setTargetAtTime(avol(),A.ctx.currentTime,.05);sndLabel()};
sndLabel();

sfx.voice=function(k,ms){({
  log:()=>{tone(1318,.25,'sine',.06,ms);tone(1976,.3,'sine',.035,ms+70)},
  enc:()=>{[1568,1760,2093].forEach((f,i)=>tone(f,.12,'triangle',.045,ms+i*55))},
  heart:()=>{tone(392,.6,'sine',.08,ms);tone(587,.7,'sine',.05,ms+90)},
  hive:()=>{tone(147,1.2,'sine',.09,ms);tone(196.6,1.3,'sine',.06,ms+60);tone(294.8,1.1,'sine',.04,ms+140)},
  chit:()=>{tone(82,.35,'square',.07,ms,60);noise(.08,.05,ms,300)},
  sweet:()=>{tone(523,.35,'sine',.07,ms,784);tone(1046,.25,'sine',.03,ms+200)},
  wag:()=>{for(let i=0;i<4;i++)tone(i%2?988:880,.07,'triangle',.06,ms+i*60)},
  auth:()=>{tone(233,.3,'sawtooth',.05,ms);tone(311,.35,'sawtooth',.05,ms+40)}})[k]()};
sfx.chat=ms=>{tone(1175,.12,'sine',.09,ms);tone(1568,.2,'sine',.07,ms+90)};
sfx.cringe=ms=>{tone(415,.5,'sawtooth',.08,ms,220);tone(392,.6,'sawtooth',.06,ms+260,185)};
sfx.thought=ms=>{[392,494,587,740,988].forEach((f,i)=>tone(f,1.2,'sine',.06,ms+i*110))};
