/* Арты: игра ищет картинку сначала в assets/web (сжатые для сети), потом в assets/img (оригиналы).
   Нет картинки — рисует кодом. */
const ART={};
(function(){
  const names=['p_rusya','p_bogdan','p_yarik','p_ilya','p_misha','p_queen','p_guard',
    'bg_clover','bg_hub','bg_kitchen','bg_pump','bg_shed','bg_gazebo','bg_far','bg_gate','bg_queen',
    's_log','s_enc','s_heart','s_hive','s_chit','s_sweet','s_wag','s_auth'];
  const tries=n=>['assets/web/'+n+'.jpg','assets/img/'+n+'.jpg','assets/img/'+n+'.png','assets/img/'+n+'.webp','assets/img/'+n+'.jpeg'];
  names.forEach(n=>{let i=0;const t=tries(n),im=new Image();
    im.onload=()=>{ART[n]=im.src;if(n.indexOf('bg_')===0&&AFX.load)AFX.load(n.slice(3),im.src);if(typeof artReady==='function')artReady()};
    im.onerror=()=>{if(++i<t.length)im.src=t[i]};
    im.src=t[0]});
})();
