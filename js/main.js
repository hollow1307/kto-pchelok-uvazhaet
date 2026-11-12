fresh();
hud();
$('splitPic').onclick=()=>{sfx.click();setSplit(split-1)};
$('splitTxt').onclick=()=>{sfx.click();setSplit(split+1)};
$('split').onclick=e=>{if(e.target===$('split')||e.target===$('splitLbl'))setSplit(split===0?1:split)};
setSplit(split);
showMenu();
