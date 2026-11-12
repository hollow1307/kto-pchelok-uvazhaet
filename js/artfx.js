/* Живые арты: фон-картина рисуется через WebGL (течёт, дышит, реагирует на мышь),
   поверх — частицы: пчёлы, пар, дым, капли, пыль. Если текстуру загрузить нельзя
   (например, при открытии файла двойным кликом), остаётся обычная картинка. */
const AFX={pan:0,phone:()=>innerWidth<=820||innerHeight<=520,tex:{},cur:null,prev:null,fade:1,want:null,m:[0,0],mt:[0,0],active:false,T:0};
/* Эмиттеры в координатах картинки (0..1). */
const EMIT={
 clover:[['motes',.5,.45,.5,.4,30],['bees',.45,.4,.4,.25,5]],
 hub:[['glow',.5,.135,.085,'255,170,60'],['bees',.5,.52,.42,.25,9],['motes',.5,.6,.5,.3,16]],
 kitchen:[['steam',.352,.385],['glow',.84,.33,.07,'255,190,90'],['motes',.5,.45,.45,.35,14],['bees',.58,.5,.1,.08,2]],
 pump:[['drip',.345,.5,.69],['motes',.5,.4,.5,.3,12],['bees',.3,.7,.12,.05,3]],
 shed:[['motes',.27,.48,.22,.3,46],['glow',.1,.26,.09,'255,200,120']],
 gazebo:[['smoke',.722,.47],['motes',.5,.4,.5,.35,16],['glow',.5,.4,.12,'200,120,255']],
 far:[['orbit',.47,.36,.12,.065,11],['motes',.5,.7,.5,.2,14],['glow',.62,.47,.16,'150,255,120']],
 gate:[['glow',.5,.47,.2,'255,160,40'],['bees',.5,.56,.3,.06,5],['motes',.5,.5,.4,.2,10]],
 queen:[['glow',.5,.6,.16,'255,190,60'],['motes',.5,.5,.5,.45,44],['drip',.2,.2,.8],['drip',.83,.25,.78]]
};
(function(){
 const cv=$('glart'),fx=$('fx'),scene=$('scene');let gl=null;
 try{gl=cv.getContext('webgl',{antialias:false})}catch(e){}
 if(!gl)return;
 const FSA=`precision mediump float;
uniform sampler2D ta,tb,ti,tz;uniform vec2 R,sa,sb,look;uniform float pan,T,trip,kal,hit,dusk,fade,blink,eyeA,eyeB,hasZ;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}
float hexd(vec2 p){p=abs(p);return max(p.x,dot(p,vec2(.5,.866)));}
vec2 hexg(vec2 p){vec2 r=vec2(1.,1.732),hh=r*.5;vec2 a=mod(p,r)-hh,b=mod(p-hh,r)-hh;return dot(a,a)<dot(b,b)?a:b;}
/* Глаз на пасеке. Координаты — доли картинки 1600×900: разрез глаза и рамка радужки. */
vec3 eyeLayer(sampler2D t,vec2 tc,vec3 c){
 float nx=(tc.x-.505)/.191875,g=1.-nx*nx;if(g<=0.)return c;
 float px=1./900.,mid=.16333-.013889*nx,top=mid-.14*pow(g,1.15),bot=mid+.10222*pow(g,.8);
 float open=smoothstep(top-px,top+2.*px,tc.y)*smoothstep(bot+px,bot-2.*px,tc.y);
 vec2 iu=(tc-vec2(.415,.015556)-look*vec2(.03,.0078))/vec2(.18625,.254444);
 if(iu.x>0.&&iu.x<1.&&iu.y>0.&&iu.y<1.){vec4 ir=texture2D(ti,iu);c=mix(c,ir.rgb,ir.a*open);}
 c*=1.-.22*open*(1.-smoothstep(0.,.03,tc.y-top));
 float lidY=mix(top-2.*px,bot+px,blink);
 float cover=smoothstep(lidY+1.5*px,lidY-1.5*px,tc.y)*smoothstep(top-8.*px,top-2.*px,tc.y);
 if(cover>0.){vec3 lid;
  if(hasZ>.5)lid=texture2D(tz,tc).rgb;
  else{float k=lidY-tc.y;lid=texture2D(t,vec2(tc.x,top-.005-k*.75)).rgb*mix(.8,1.,smoothstep(0.,.03,k));}
  c=mix(c,lid,cover);}
 float lash=exp(-pow((tc.y-lidY-1.5*px)/(3.*px),2.))*smoothstep(top+.004,top+.02,lidY);
 c*=1.-.6*lash;
 c*=1.-.3*open*smoothstep(.025,0.,tc.y-lidY)*step(lidY,tc.y)*smoothstep(top+.004,top+.02,lidY);
 return c;}
vec3 samp(sampler2D t,vec2 s,vec2 uv,vec2 w,float amp,float eye,out float band){
 vec2 p=(uv-.5)*s;float z=1.05+.025*sin(T*.05);p/=z;p+=vec2(.01*sin(T*.031),.006*cos(T*.027));p.x+=pan*.5*max(0.,1.-s.x/z);
 p+=w*amp;band=max(abs(p.x),abs(p.y))-.5;
 vec2 tc=clamp(p+.5,0.,1.);float ca=.0008+.0016*trip+.012*hit;
 vec3 c=vec3(texture2D(t,tc+vec2(ca,0.)).r,texture2D(t,tc).g,texture2D(t,tc-vec2(ca,0.)).b);
 if(eye>.5)c=eyeLayer(t,tc,c);
 return c;}
void main(){
 vec2 uv=gl_FragCoord.xy/R;uv.y=1.-uv.y;
 vec2 q=vec2(fbm(uv*3.+T*.05),fbm(uv*3.+vec2(5.2,1.3)-T*.04))-.5;
 float amp=.006+.02*trip+.09*sin(fade*3.1416);
 vec2 pr=uv-.5;uv+=normalize(pr+vec2(.0001))*sin(length(pr)*28.-T*1.6)*.0035*kal;
 float b1,b2;vec3 A=samp(ta,sa,uv,q,amp,eyeA,b1),B=samp(tb,sb,uv,q,amp,eyeB,b2);
 float m=clamp(fade*1.7-.35+q.x*.7,0.,1.);m=m*m*(3.-2.*m);
 vec3 col=mix(A,B,m);float band=mix(b1,b2,m);
 float edge=smoothstep(-.012,.1,band+q.y*.06);col=mix(col,col*.13+vec3(.02,.012,.03),edge);
 float lum=dot(col,vec3(.3,.59,.11));col+=col*smoothstep(.5,1.,lum)*(.14+.13*sin(T*1.1+q.x*18.));
 col=mix(col,col.gbr,.1*trip*(.5+.5*sin(T*.25+q.y*9.)));
 vec2 hp=(uv+q*.05)*vec2(R.x/R.y,1.)*7.;float hd=hexd(hexg(hp));
 col+=vec3(1.,.8,.3)*smoothstep(.44,.5,hd)*(.025+.1*trip)*smoothstep(.25,.7,fbm(uv*2.-T*.03));
 col=mix(col,col.gbr,hit*.8);col+=hit*.1;
 col=mix(col,col*vec3(.25,.24,.55)+vec3(0.,0.,.03),dusk);
 col*=1.-.7*dot(uv-.5,uv-.5);col+=(h(gl_FragCoord.xy+fract(T))-.5)*.05;
 gl_FragColor=vec4(col,1.);}`;
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
 const pr=gl.createProgram();
 gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
 gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FSA));gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
 gl.useProgram(pr);
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const al=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
 const U={};['ta','tb','ti','tz','R','sa','sb','look','pan','T','trip','kal','hit','dusk','fade','blink','eyeA','eyeB','hasZ'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
 gl.uniform1i(U.ta,0);gl.uniform1i(U.tb,1);gl.uniform1i(U.ti,2);gl.uniform1i(U.tz,3);
 /* Слои глаза: белок без радужки, сама радужка, и (если есть) та же картина с закрытым глазом. */
 const EYE={};
 function tex(url,rgba,cb){const im=new Image();im.onload=()=>{try{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
   gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
   gl.texImage2D(gl.TEXTURE_2D,0,rgba?gl.RGBA:gl.RGB,rgba?gl.RGBA:gl.RGB,gl.UNSIGNED_BYTE,im);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);cb(t)}catch(e){}};im.src=url}
 tex('assets/web/bg_hub_empty.jpg',0,t=>EYE.empty=t);
 tex('assets/web/eye_iris.png',1,t=>EYE.iris=t);
 AFX.loadClosed=url=>tex(url,0,t=>EYE.closed=t);

 AFX.load=function(name,url){const im=new Image();
  im.onload=()=>{try{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    AFX.tex[name]={t,ia:im.naturalWidth/im.naturalHeight,name};
    if(AFX.want===name)AFX.set(name)}catch(e){}};
  im.src=url};
 AFX.set=function(name){AFX.want=name;const x=name&&AFX.tex[name];
  if(!x){AFX.active=false;scene.classList.remove('gltex');return}
  if(AFX.cur!==x){AFX.prev=AFX.cur||x;AFX.cur=x;AFX.fade=AFX.prev===x?1:0;fxInit(name)}
  if(!AFX.active){AFX.active=true;scene.classList.add('gltex');if(typeof placePins==='function')placePins()}};
 const fit=(ia,W,Hh)=>{const ra=W/Hh,cover=ra>ia?[1,ia/ra]:[ra/ia,1],contain=ra>ia?[ra/ia,1]:[1,ia/ra];
  const k=AFX.phone()?1:ra<1?.9:ra<1.25?.6:.35;return [cover[0]*k+contain[0]*(1-k),cover[1]*k+contain[1]*(1-k)]};
 /* Координаты картинки (0..1) → пиксели сцены. Повторяет математику шейдера без «течения». */
 AFX.map=function(ix,iy,still){const W=scene.clientWidth,Hh=scene.clientHeight;if(!AFX.cur)return [ix*W,iy*Hh];
  const s=fit(AFX.cur.ia,W,Hh),T=AFX.T;let px=ix-.5,py=iy-.5;
  if(!still){px-=.01*Math.sin(T*.031);py-=.006*Math.cos(T*.027)}
  const z=still?1.05:1.05+.025*Math.sin(T*.05);px-=AFX.pan*.5*Math.max(0,1-s[0]/z);
  return [(px*z/s[0]+.5)*W,(py*z/s[1]+.5)*Hh]};
 /* Можно ли листать: какая доля ширины картины видна. */
 AFX.visible=function(){if(!AFX.cur)return 1;return fit(AFX.cur.ia,scene.clientWidth,scene.clientHeight)[0]/1.05};

 /* ---------- частицы ---------- */
 const cx=fx.getContext('2d');let ems=[];
 const rnd=(a,b)=>a+Math.random()*(b-a);
 function fxInit(name){ems=(EMIT[name]||[]).map(e=>{const o={e,p:[],t:0};const [type,x,y,rx,ry,cnt]=e;
   if(type==='motes')for(let i=0;i<cnt;i++)o.p.push({x:x+rnd(-rx,rx),y:y+rnd(-ry,ry),ph:rnd(0,7),sp:rnd(.2,.8),r:rnd(1,2.6)});
   if(type==='bees')for(let i=0;i<cnt;i++)o.p.push({x:x+rnd(-rx,rx),y:y+rnd(-ry,ry),tx:x,ty:y,vx:0,vy:0,w:0});
   if(type==='orbit')for(let i=0;i<cnt;i++)o.p.push({a:i/cnt*6.283,sp:rnd(.5,.9),j:rnd(0,7)});
   return o})}
 function drawBee(x,y,a,s,t){cx.save();cx.translate(x,y);cx.rotate(a);cx.scale(s,s);
  cx.fillStyle='rgba(255,255,255,'+(.3+.25*Math.sin(t*70)).toFixed(2)+')';
  cx.beginPath();cx.ellipse(-1,-4,4.4,2.3,-.5,0,6.3);cx.ellipse(-1,4,4.4,2.3,.5,0,6.3);cx.fill();
  cx.fillStyle='#f6b21a';cx.beginPath();cx.ellipse(0,0,5,3.1,0,0,6.3);cx.fill();
  cx.fillStyle='#1a0f06';cx.fillRect(-2.4,-2.9,1.5,5.8);cx.fillRect(.5,-2.7,1.5,5.4);cx.beginPath();cx.arc(4.7,0,2.1,0,6.3);cx.fill();
  cx.restore()}
 function puff(x,y,r,a,rgb){const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(1,'rgba('+rgb+',0)');
  cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r,0,6.3);cx.fill()}
 function fxDraw(dt,T){const W=fx.width,Hh=fx.height,k=W/scene.clientWidth;cx.clearRect(0,0,W,Hh);
  const M=(x,y)=>{const p=AFX.map(x,y);return [p[0]*k,p[1]*k]};
  for(const o of ems){const [type,x,y,rx,ry]=o.e;o.t+=dt;
   if(type==='glow'){cx.globalCompositeOperation='lighter';const p=M(x,y);puff(p[0],p[1],rx*W*(1+.12*Math.sin(T*1.3)),(.2+.1*Math.sin(T*.9)).toFixed(3),o.e[4])}
   if(type==='motes'){cx.globalCompositeOperation='lighter';for(const m of o.p){
     const p=M(m.x+.02*Math.sin(T*m.sp+m.ph),m.y+.015*Math.cos(T*m.sp*.8+m.ph)-((T*m.sp*.01)%.06));
     puff(p[0],p[1],m.r*3*k,(.25+.25*Math.sin(T*2*m.sp+m.ph)).toFixed(3),'255,220,150')}}
   if(type==='bees'){cx.globalCompositeOperation='source-over';for(const b of o.p){b.w-=dt;
     if(b.w<=0){b.tx=x+rnd(-rx,rx);b.ty=y+rnd(-ry,ry);b.w=rnd(.6,2.2)}
     b.vx+=((b.tx-b.x)*3-b.vx*2.2)*dt;b.vy+=((b.ty-b.y)*3-b.vy*2.2)*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
     const p=M(b.x+.004*Math.sin(T*9+b.tx*50),b.y+.004*Math.cos(T*11));drawBee(p[0],p[1],Math.atan2(b.vy,b.vx),1.2*k,T)}}
   if(type==='orbit'){cx.globalCompositeOperation='source-over';for(const b of o.p){b.a+=b.sp*dt;
     const ox=x+rx*Math.cos(b.a)+.006*Math.sin(T*5+b.j),oy=y+ry*Math.sin(b.a)+.006*Math.cos(T*6+b.j);
     const p=M(ox,oy);drawBee(p[0],p[1],b.a+1.57,1.3*k,T)}}
   if(type==='steam'||type==='smoke'){const sm=type==='smoke';
     if(o.t>.22){o.t=0;o.p.push({l:0,dx:rnd(-.5,.5)})}
     cx.globalCompositeOperation=sm?'source-over':'lighter';
     o.p=o.p.filter(q=>(q.l+=dt/4)<1);
     for(const q of o.p){const p=M(x+.03*q.dx*q.l+.012*Math.sin(T*1.5+q.dx*9)*q.l,y-.16*q.l);
       puff(p[0],p[1],(10+60*q.l)*k,((1-q.l)*(sm?.2:.16)).toFixed(3),sm?'205,195,215':'255,250,240')}}
   if(type==='drip'){const y1=rx,ph=(o.t%1.6)/1.6;cx.globalCompositeOperation='lighter';
     if(ph<.35){const f=ph/.35,p=M(x,y+(y1-y)*f*f);puff(p[0],p[1],5*k,.8,'200,235,255')}
     else{const f=(ph-.35)/.65,p=M(x,y1);cx.strokeStyle='rgba(200,235,255,'+((1-f)*.6).toFixed(2)+')';cx.lineWidth=2*k;
       cx.beginPath();cx.ellipse(p[0],p[1],(6+34*f)*k,(2+10*f)*k,0,0,6.3);cx.stroke()}}}
  cx.globalCompositeOperation='source-over'}

 let lastMove=-9;
 document.addEventListener('pointermove',e=>{const b=scene.getBoundingClientRect();AFX.mp=[e.clientX-b.left,e.clientY-b.top];lastMove=AFX.T});
 let look=[0,0],wander=[0,0],wanderT=0,blinkIn=2.5,bt=-1;
 const ease=x=>x*x*(3-2*x);
 const slow=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion:reduce)').matches?.15:1;
 let last=0;
 function frame(ts){requestAnimationFrame(frame);
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  if(!AFX.active||!AFX.cur)return;
  AFX.T+=dt*slow*(1+G.trip*.6);AFX.fade=Math.min(1,AFX.fade+dt/1.4);
  const cw=scene.clientWidth,ch=scene.clientHeight,sc=Math.min(1.5,window.devicePixelRatio||1,1700/Math.max(1,cw));
  const w=Math.max(2,Math.round(cw*sc)),hh=Math.max(2,Math.round(ch*sc));
  if(cv.width!==w||cv.height!==hh){cv.width=w;cv.height=hh;gl.viewport(0,0,w,hh);fx.width=w;fx.height=hh}
  const a=AFX.prev||AFX.cur,b=AFX.cur,sa=fit(a.ia,cw,ch),sb=fit(b.ia,cw,ch);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,a.t);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,b.t);
  gl.uniform2f(U.R,w,hh);gl.uniform2f(U.sa,sa[0],sa[1]);gl.uniform2f(U.sb,sb[0],sb[1]);
  // глаз на пасеке: следит за курсором, моргает, к вечеру прикрывается
  const eyeOn=!!(EYE.empty&&EYE.iris);
  if(eyeOn){
   // куда смотреть: на курсор, а если мышь давно не двигалась — оглядывает пасеку сам
   const ep=AFX.map(.505,.15,true);let tx,ty;
   if(AFX.mp&&AFX.T-lastMove<3){tx=(AFX.mp[0]-ep[0])/(cw*.32);ty=(AFX.mp[1]-ep[1])/(ch*.32)}
   else{wanderT-=dt;if(wanderT<0){wander=[Math.random()*1.6-.8,Math.random()*1-.3];wanderT=1.2+Math.random()*2.4}tx=wander[0];ty=wander[1]}
   const L=Math.hypot(tx,ty);if(L>1){tx/=L;ty/=L}
   const k=1-Math.exp(-dt*9);look[0]+=(tx-look[0])*k;look[1]+=(ty-look[1])*k;
   // моргание: быстро закрылся, чуть задержался, мягко открылся
   blinkIn-=dt;if(bt<0&&blinkIn<0){bt=0;blinkIn=2.8+Math.random()*4.5;if(Math.random()<.2)blinkIn=.45}
   let v=0;if(bt>=0){bt+=dt;const c=.1,hd=.06,o=.22;
     v=bt<c?ease(bt/c):bt<c+hd?1:bt<c+hd+o?1-ease((bt-c-hd)/o):0;if(bt>=c+hd+o)bt=-1}
   const base=Math.min(.82,G.dusk*1.1);
   gl.uniform2f(U.look,look[0],look[1]);gl.uniform1f(U.blink,AFX.blinkHold!=null?AFX.blinkHold:base+(1-base)*v);
   gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,EYE.iris);
   if(EYE.closed){gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,EYE.closed)}
   gl.uniform1f(U.hasZ,EYE.closed?1:0);
   if(a.name==='hub'){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,EYE.empty)}
   if(b.name==='hub'){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,EYE.empty)}}
  gl.uniform1f(U.eyeA,eyeOn&&a.name==='hub'?1:0);gl.uniform1f(U.eyeB,eyeOn&&b.name==='hub'?1:0);
  gl.uniform1f(U.pan,AFX.pan);
  if(typeof placePins==='function'&&AFX.pinsDirty!==AFX.pan){AFX.pinsDirty=AFX.pan;placePins()}
  gl.uniform1f(U.T,AFX.T);gl.uniform1f(U.trip,G.trip);gl.uniform1f(U.kal,G.kal);gl.uniform1f(U.hit,G.hit);gl.uniform1f(U.dusk,G.dusk);gl.uniform1f(U.fade,AFX.fade);
  gl.drawArrays(gl.TRIANGLES,0,3);
  fxDraw(dt*slow,AFX.T)}
 requestAnimationFrame(frame);
})();

/* Листание картины пальцем или мышью, если она шире кадра. */
(function(){const sc=$('scene');let x0=null,p0=0,moved=false;
 const skip=t=>t.closest('button,.pin,.pcard,#panel,#mg,#hud,input,textarea,#mainmenu,#split');
 sc.addEventListener('pointerdown',e=>{if(skip(e.target)||!AFX.active)return;const v=AFX.visible();if(v>.97)return;x0=e.clientX;p0=AFX.pan;moved=false});
 addEventListener('pointermove',e=>{if(x0==null)return;const dx=e.clientX-x0;if(Math.abs(dx)>6)moved=true;if(!moved)return;
   const v=AFX.visible(),W=sc.clientWidth;AFX.pan=Math.max(-1,Math.min(1,p0-dx/W*v/Math.max(.001,(1-v)/2)/1));
   const h=$('panhint');if(h&&h.classList.contains('on')){h.classList.remove('on');try{localStorage.setItem('bees_panhint','1')}catch(err){}}});
 addEventListener('pointerup',()=>{x0=null});addEventListener('pointercancel',()=>{x0=null});
})();
