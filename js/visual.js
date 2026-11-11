const FS=`
precision mediump float;
uniform vec2 R,sun;uniform float T,trip,kal,hit,dusk;uniform vec3 c1,c2,c3,c4;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}
float hexd(vec2 p){p=abs(p);return max(p.x,dot(p,vec2(.5,.866)));}
vec2 hexg(vec2 p){vec2 r=vec2(1.,1.732),hh=r*.5;vec2 a=mod(p,r)-hh,b=mod(p-hh,r)-hh;return dot(a,a)<dot(b,b)?a:b;}
void main(){
 vec2 uv=gl_FragCoord.xy/R;vec2 p=(gl_FragCoord.xy-.5*R)/R.y;
 vec2 sp=(uv-sun)*vec2(R.x/R.y,1.);
 float an=atan(sp.y,sp.x)+T*.03,rr=length(sp);an=abs(mod(an,1.0472)-.5236);
 p=mix(p,rr*vec2(cos(an),sin(an))*1.4,kal);
 float t=T*.06;
 vec2 q=vec2(fbm(p*1.6+t),fbm(p*1.6+vec2(5.2,1.3)-t));
 vec2 w=vec2(fbm(p*1.6+3.5*q+vec2(1.7,9.2)+t*1.5),fbm(p*1.6+3.5*q+vec2(8.3,2.8)-t*1.2));
 float f=fbm(p*1.6+(2.5+2.5*trip)*w);
 vec3 col=mix(c1,c2,smoothstep(.2,.7,f));
 col=mix(col,c3,smoothstep(.3,.85,length(q)*f*1.9));
 col=mix(col,c4,smoothstep(.5,.9,w.x)*.75);
 float bands=sin(f*(18.+30.*trip)+T*.4);
 col+=(.07+.2*trip)*bands*cos(6.283*(f+T*.03+vec3(0.,.33,.67)));
 float d=length(sp);float rings=sin(d*(34.+f*22.)-T*1.2+w.y*6.);
 float glow=exp(-d*2.6);
 col=mix(col,c3+.3*rings*c4,glow*(.7+.3*rings));
 vec2 hp=(p+w*.3*(.5+trip))*(5.+1.5*sin(T*.1));float hd=hexd(hexg(hp));
 float edge=smoothstep(.41,.5,hd);
 float mask=smoothstep(.3,.8,fbm(p*.9-t*2.)+trip*.35);
 col=mix(col,col*.3+c3,edge*mask*.8);
 col+=c4*mask*.14*sin(hd*22.-T*2.);
 col=mix(col,col.gbr,hit*.85);col+=hit*.12;
 col=mix(col,col*vec3(.22,.2,.5)+vec3(0.,0.,.04),dusk);
 col*=1.-.9*dot(uv-.5,uv-.5);
 col+=(h(gl_FragCoord.xy+fract(T))-.5)*.08;
 gl_FragColor=vec4(col,1.);
}
`;
/* ---------- портреты (выдуманные, экспрессионистские) ---------- */
const PX={
 rusya:'<polygon points="100,8 108,30 131,30 112,44 119,66 100,52 81,66 88,44 69,30 92,30" fill="#ffe14a" stroke="#0b0508" stroke-width="3"/><circle cx="100" cy="212" r="20" fill="#ffe14a" stroke="#0b0508" stroke-width="4"/><text x="100" y="222" text-anchor="middle" font-family="Impact,Arial" font-weight="700" font-size="28" fill="#0b0508">F</text>',
 bogdan:'<g id="cl"><path d="M34 176 C10 150 8 112 36 92 C34 112 44 122 54 118 C52 100 62 88 78 92 C84 130 66 168 34 176Z" fill="#ff3d2e" stroke="#0b0508" stroke-width="4"/></g><use href="#cl" transform="translate(200 0) scale(-1 1)"/>',
 yarik:'<g fill="none" stroke="#0b0508" stroke-width="5"><circle cx="82" cy="108" r="17" fill="rgba(255,255,255,.35)"/><circle cx="120" cy="108" r="17" fill="rgba(255,255,255,.35)"/><path d="M99 106h4"/></g><path d="M52 214 L100 200 L148 214 L148 248 L100 236 L52 248Z" fill="#fff3c4" stroke="#0b0508" stroke-width="4"/><path d="M100 200V236" stroke="#0b0508" stroke-width="3"/>',
 ilya:'<path d="M140 100 C150 60 176 30 194 8 C190 50 172 86 150 112Z" fill="#fff" stroke="#0b0508" stroke-width="3"/><path d="M142 104 L190 16" stroke="#0b0508" stroke-width="2"/><path d="M58 172 Q100 196 142 172 L150 196 Q100 222 50 196Z" fill="#ff2bd6" stroke="#0b0508" stroke-width="4"/>',
 misha:'<circle cx="64" cy="62" r="19" fill="#5a3413" stroke="#0b0508" stroke-width="4"/><circle cx="136" cy="62" r="19" fill="#5a3413" stroke="#0b0508" stroke-width="4"/><circle cx="64" cy="62" r="8" fill="#ffb86b"/><circle cx="136" cy="62" r="8" fill="#ffb86b"/>'
};
const PF={rusya:['#ffb300','#ff2bd6','#3b0a4a'],bogdan:['#22d3ee','#ff7a1f','#3a0606'],yarik:['#b6f24a','#22a3ee','#08243a'],
  ilya:['#ffd0f0','#7c3aed','#1e0b36'],misha:['#ffb86b','#16a34a','#07140f']};
function portrait(k){const [a,b,bg]=PF[k];const back=k==='misha'||k==='rusya';
 const bust='<path d="M14 252 Q22 172 100 166 Q178 172 186 252Z" fill="#0b0508"/><path d="M30 252 Q40 186 100 180 L100 252Z" fill="'+b+'" opacity=".55"/>'+
  '<rect x="84" y="150" width="32" height="30" fill="'+b+'" stroke="#0b0508" stroke-width="4"/>'+
  '<path d="M100 54 C66 54 56 84 58 112 C60 146 80 166 100 166Z" fill="'+a+'"/><path d="M100 54 C134 54 144 84 142 112 C140 146 120 166 100 166Z" fill="'+b+'"/>'+
  '<path d="M100 54 C66 54 56 84 58 112 C60 146 80 166 100 166 C120 166 140 146 142 112 C144 84 134 54 100 54Z" fill="none" stroke="#0b0508" stroke-width="5"/>'+
  '<path d="M70 104 q12 -9 24 0 M108 104 q12 -9 24 0" fill="none" stroke="#0b0508" stroke-width="5" stroke-linecap="round"/>'+
  '<circle cx="82" cy="108" r="4" fill="#0b0508"/><circle cx="120" cy="108" r="4" fill="#0b0508"/>'+
  '<path d="M100 108 L94 132 L104 132" fill="none" stroke="#0b0508" stroke-width="4"/><path d="M84 146 Q100 154 116 144" fill="none" stroke="#0b0508" stroke-width="5" stroke-linecap="round"/>'+
  '<path d="M62 92 C70 60 130 56 140 90 C120 74 84 76 62 92Z" fill="#0b0508"/>';
 return '<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg"><defs><filter id="pf"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="'+k.length*3+'"/><feDisplacementMap in="SourceGraphic" scale="13"/></filter>'+
  '<radialGradient id="pg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="'+a+'"/><stop offset=".5" stop-color="'+b+'"/><stop offset="1" stop-color="'+bg+'"/></radialGradient></defs>'+
  '<rect width="200" height="250" fill="'+bg+'"/><g filter="url(#pf)"><circle cx="100" cy="105" r="120" fill="url(#pg)" opacity=".85"/>'+
  [0,1,2,3,4,5].map(i=>'<path d="M100 105 L'+(100+260*Math.cos(i*1.047+.3))+' '+(105+260*Math.sin(i*1.047+.3))+' L'+(100+260*Math.cos(i*1.047+.62))+' '+(105+260*Math.sin(i*1.047+.62))+'Z" fill="'+(i%2?a:'#fff')+'" opacity=".22"/>').join('')+
  (k==='misha'?'<g opacity=".35" transform="translate(-22 6)">'+PX[k]+bust+'</g>':'')+
  (back?PX[k]:'')+bust+(back?(k==='rusya'?'<circle cx="100" cy="212" r="20" fill="#ffe14a" stroke="#0b0508" stroke-width="4"/><text x="100" y="222" text-anchor="middle" font-family="Impact,Arial" font-weight="700" font-size="28" fill="#0b0508">F</text>':''):PX[k])+
  '</g></svg>'}

/* ---------- фон: шейдер ---------- */
const PAL={start:['#1a0b2e','#c2410c','#f6c453','#0ea5a4',0],hub:['#1a0b2e','#c2410c','#f6c453','#0ea5a4',0],
 pick:['#12062a','#a21caf','#fbbf24','#22d3ee',0],
 k1:['#2a0a0a','#d97706','#fde68a','#be185d',0],b1:['#04162e','#0e7490','#a7f3d0','#7c3aed',0],
 y1:['#0f1b12','#4d7c0f','#fef08a','#c2410c',0],i1:['#1e0b36','#9333ea','#f9a8d4','#f59e0b',0],
 m1:['#07140f','#15803d','#d9f99d','#be123c',0],gate:['#1c0f02','#b45309','#fde047','#dc2626',0],
 queen:['#190426','#d946ef','#fbbf24','#22d3ee',1],e_top:['#2a0440','#ff2bd6','#ffe14a','#22d3ee',1],
 e_mid:['#1a0b2e','#c2410c','#f6c453','#0ea5a4',0],e_low:['#0c0c0e','#3f3f46','#a1a1aa','#57534e',0],
 swollen:['#2a0505','#b91c1c','#fca5a5','#7f1d1d',0],
 chat:['#070b18','#1b2a4a','#8fb4ff','#22d3ee',0]};
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
const G={cur:PAL.start.slice(0,4).map(rgb),tg:PAL.start.slice(0,4).map(rgb),trip:.2,tripT:.2,kal:0,kalT:0,hit:0,T:0,dusk:0,duskT:0};
(function(){
 const cv=$('gl');let gl=null;try{gl=cv.getContext('webgl',{antialias:false})}catch(e){}
 if(!gl){cv.style.display='none';return}
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
 const pr=gl.createProgram();
 gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
 gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));
 gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){cv.style.display='none';return}
 gl.useProgram(pr);
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const al=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
 const U={};['R','sun','T','trip','kal','hit','dusk','c1','c2','c3','c4'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
 const slow=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion:reduce)').matches?.15:1;
 let last=0;
 function frame(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;G.T+=dt*slow*(1+G.trip*.8);
  const w=Math.max(2,Math.round(cv.clientWidth*.55)),h=Math.max(2,Math.round(cv.clientHeight*.55));
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;gl.viewport(0,0,w,h)}
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)G.cur[i][j]+=(G.tg[i][j]-G.cur[i][j])*.03;
  G.trip+=(G.tripT-G.trip)*.03;G.kal+=(G.kalT-G.kal)*.025;G.hit*=.93;G.dusk+=(G.duskT-G.dusk)*.02;
  gl.uniform2f(U.R,w,h);gl.uniform2f(U.sun,.6,.62);gl.uniform1f(U.T,G.T);
  gl.uniform1f(U.trip,G.trip);gl.uniform1f(U.kal,G.kal);gl.uniform1f(U.hit,G.hit);gl.uniform1f(U.dusk,G.dusk);
  for(let i=0;i<4;i++)gl.uniform3fv(U['c'+(i+1)],G.cur[i]);
  if(typeof AFX==='undefined'||!AFX.active)gl.drawArrays(gl.TRIANGLES,0,3);requestAnimationFrame(frame)}
 requestAnimationFrame(frame);
})();
document.addEventListener('mousemove',e=>{const r=$('eye').getBoundingClientRect();
  const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy)||1;
  $('pup').setAttribute('transform','translate('+(dx/d*Math.min(26,d/12)).toFixed(1)+' '+(dy/d*Math.min(12,d/20)).toFixed(1)+')')});


(function(){const w=$('bees');for(let i=0;i<18;i++){const b=document.createElement('i');b.className='bee';
  const r=()=>(Math.random()*220-110).toFixed(0)+'px';
  b.style.cssText='left:'+(12+Math.random()*76)+'%;top:'+(30+Math.random()*50)+'%;--d:'+(5+Math.random()*9).toFixed(1)+'s;--x1:'+r()+';--y1:'+r()+';--x2:'+r()+';--y2:'+r()+';--x3:'+r()+';--y3:'+r();
  w.append(b)}})();
