/* Музыка: маленький секвенсор на WebAudio. У каждой локации свой стиль.
   Если в assets/audio лежит mp3 с именем стиля (hub.mp3, kitchen.mp3, pump.mp3, shed.mp3,
   gazebo.mp3, far.mp3, queen.mp3), вместо синтезатора играет он. */
const MUSIC=(function(){
 const STY={
  hub:{bpm:70,ch:[[50,53,57,60,64],[46,50,53,57],[53,57,60,64],[48,52,55,62]],pad:[900,'sawtooth',.022],
    arp:['triangle',12,.05,[0,,2,,3,,2,,4,,3,,2,,1,]],bass:'x.......x.....x.',hat:'..x...x...x...x.'},
  kitchen:{bpm:100,ch:[[48,52,55,60],[45,48,52,57],[41,45,48,53],[43,47,50,55]],pad:[700,'triangle',.02],
    arp:['square',12,.022,[0,1,2,3,2,1,0,1,2,3,2,1,0,2,1,3]],bass:'x...x...x...x...',kick:'x.......x.......',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.x.'},
  pump:{bpm:76,ch:[[52,55,59,62,66],[48,52,55,59],[43,47,50,57],[50,54,57,61]],pad:[800,'sine',.035],
    arp:['sine',12,.07,[0,,,2,,,4,,3,,,1,,,2,]],bass:'x...............'},
  shed:{bpm:104,ch:[[45,48,52,57],[50,53,57,62],[43,47,50,55],[48,52,55,60]],pad:[600,'triangle',.018],
    arp:['triangle',12,.05,[0,,2,,1,,2,,0,,2,,1,,3,]],bass:'x.......x.......'},
  gazebo:{bpm:86,swing:.17,ch:[[53,56,60,63],[49,53,56,60],[56,60,63,67],[51,55,58,62]],pad:[1300,'triangle',.03],stab:'x.........x.....',
    arp:['sine',12,.04,[,,,,,,3,,,,,,2,,,]],bass:'x.....x...x.....',kick:'x.....x...x.....',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.xx'},
  far:{bpm:58,ch:[[38,50,53,57],[38,50,53,58],[34,46,50,53],[33,45,49,52]],pad:[480,'sawtooth',.03],
    arp:['sine',24,.035,[,,,,,,,,3,,,,,,,]],bass:'x...............',kick:'x..x............',kv:.35},
  queen:{bpm:52,ch:[[50,54,57,62,66],[49,52,57,61],[47,50,54,59],[43,47,50,55,59]],pad:[2000,'sawtooth',.02],oct:1,
    arp:['sine',24,.05,[0,,,,2,,,,1,,,,3,,,]],bass:'x...............'}
 };
 const MAP={start:'hub',hub:'hub',pick:'hub',k1:'kitchen',b1:'pump',y1:'shed',i1:'gazebo',m1:'far',gate:'far',queen:'queen',
   e_top:'queen',e_mid:'hub',e_low:'far',swollen:'far',chat:'far'};
 const M={mood:'hub',want:'hub',step:0,t:0,timer:null,ext:{},cur:null,rate:1,slowUntil:0};
 const f=m=>440*Math.pow(2,(m-69)/12);
 function env(g,t,a,d,v){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
 function out(g){g.connect(A.musBus);g.connect(A.mfx)}
 function pad(m,t,d,s){const c=A.ctx,lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=s.pad[0];
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(s.pad[2],t+Math.min(.6,d*.3));
  g.gain.setValueAtTime(s.pad[2],t+d*.75);g.gain.exponentialRampToValueAtTime(.0001,t+d+.5);
  for(const det of [-6,7]){const o=c.createOscillator();o.type=s.pad[1];o.frequency.value=f(m);o.detune.value=det;o.connect(lp);o.start(t);o.stop(t+d+.6)}
  lp.connect(g);out(g)}
 function pluck(m,t,type,v,d){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f(m);env(g,t,.005,d,v);o.connect(g);out(g);o.start(t);o.stop(t+d+.1)}
 function nz(t,d,v,type,fq){const c=A.ctx,n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0);
  for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource();s.buffer=b;
  const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=fq;const g=c.createGain();g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(A.musBus);s.start(t)}
 function kick(t,v){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.16);
  env(g,t,.003,.22,v);o.connect(g);g.connect(A.musBus);o.start(t);o.stop(t+.3)}
 function play(step,t){const s=STY[M.mood],i=step%16,bar=Math.floor(step/16)%s.ch.length,ch=s.ch[bar],sd=60/(s.bpm*M.rate)/4;
  if(M.ext[M.mood])return;
  if(s.stab){if(s.stab[i]==='x')for(const m of ch)pad(m,t,sd*5,s)}
  else if(i===0)for(const m of ch){pad(m,t,sd*16,s);if(s.oct)pad(m+12,t,sd*16,{pad:[s.pad[0],'sine',s.pad[2]*.5]})}
  if(s.bass[i]==='x'){pluck(ch[0]-12,t,'triangle',.11,sd*5);pluck(ch[0]-12,t,'sine',.1,sd*6)}
  const a=s.arp,n=a[3][i];if(n!=null&&Math.random()<.9)pluck(ch[n%ch.length]+a[1],t,a[0],a[2],a[0]==='sine'?.9:.35);
  if(s.kick&&s.kick[i]==='x')kick(t,s.kv||.5);
  if(s.snare&&s.snare[i]==='x'){nz(t,.14,.16,'bandpass',1700);pluck(52,t,'triangle',.05,.1)}
  if(s.hat&&s.hat[i]==='x')nz(t,.035,.045,'highpass',7000)}
 function tick(){const c=A.ctx;if(!c)return;
  if(c.currentTime>M.slowUntil&&M.rate<1)M.rate=Math.min(1,M.rate+.004);
  while(M.t<c.currentTime+.35){const s=STY[M.mood],sd=60/(s.bpm*M.rate)/4;
    play(M.step,M.t+(M.step%2?(s.swing||0)*sd:0));M.t+=sd;M.step++;
    if(M.step%16===0&&M.want!==M.mood){M.mood=M.want;M.step=0}}
  // свои треки из assets/audio
  for(const k in M.ext){const a=M.ext[k],on=k===M.mood,target=on?A.mvol*(A.muted?0:A.vol/100):0;
    if(on&&a.paused)a.play().catch(()=>{});
    try{a.playbackRate=Math.max(.5,M.rate)}catch(e){}
    a.volume=Math.max(0,Math.min(1,a.volume+(target-a.volume)*.15));
    if(!on&&a.volume<.01&&!a.paused)a.pause()}}
 /* «Музыку замедляли силой мысли»: на полминуты темп падает почти вдвое, потом плавно возвращается. */
 M.slow=function(){M.rate=.55;M.slowUntil=A.ctx?A.ctx.currentTime+28:0};
 M.set=function(p){M.want=STY[p]?p:(MAP[p]||'hub')};
 M.start=function(){if(M.timer||!A.ctx)return;M.t=A.ctx.currentTime+.15;M.mood=M.want;M.timer=setInterval(tick,90)};
 if(typeof Audio!=='undefined')Object.keys(STY).forEach(k=>{try{const a=new Audio();a.loop=true;a.volume=0;a.preload='auto';
   a.addEventListener('canplaythrough',()=>{M.ext[k]=a},{once:true});a.src='assets/audio/'+k+'.mp3'}catch(e){}});
 return M})();
