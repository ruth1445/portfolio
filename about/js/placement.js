/* ---------- placement mode ----------
   press E to unlock, then drag any scanned object. press C to copy the layout,
   R to reset. positions are remembered in this browser. */
(function(){
  var KEY='ruth.scan.layout.v1', pos={};
  try{ pos=JSON.parse(localStorage.getItem(KEY)||'{}') }catch(e){ pos={} }
  function place(el){
    var k=el.dataset.k, p=pos[k]||{x:0,y:0};
    el.style.transform='translate('+p.x+'px,'+p.y+'px) rotate(var(--r,0deg)) skew(var(--sk,0deg),var(--sk2,0deg))';
  }
  function all(){ return [].slice.call(document.querySelectorAll('.scan .sh, .scan .doc')) }
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(pos)) }catch(e){} }
  all().forEach(place);

  var hud=document.createElement('div'); hud.className='hud';
  hud.innerHTML='Drag to move &middot; <b>C</b> copy &middot; <b>R</b> reset &middot; <b>E</b> done';
  document.body.appendChild(hud);

  var drag=null;
  document.addEventListener('pointerdown',function(e){
    if(!document.body.classList.contains('editing')) return;
    var el=e.target.closest('.scan .sh, .scan .doc'); if(!el) return;
    e.preventDefault();
    var p=pos[el.dataset.k]||{x:0,y:0};
    drag={el:el,sx:e.clientX,sy:e.clientY,ox:p.x,oy:p.y};
    el.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove',function(e){
    if(!drag) return;
    pos[drag.el.dataset.k]={x:Math.round(drag.ox+e.clientX-drag.sx),
                            y:Math.round(drag.oy+e.clientY-drag.sy)};
    place(drag.el);
  });
  document.addEventListener('pointerup',function(){ if(drag){ save(); drag=null } });

  document.addEventListener('keydown',function(e){
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    var k=e.key.toLowerCase();
    if(k==='e'){ document.body.classList.toggle('editing') }
    else if(k==='r' && document.body.classList.contains('editing')){
      pos={}; save(); all().forEach(place);
    } else if(k==='c' && document.body.classList.contains('editing')){
      var t=JSON.stringify(pos);
      if(navigator.clipboard) navigator.clipboard.writeText(t);
      hud.innerHTML='Copied';
      setTimeout(function(){ hud.innerHTML='Drag to move &middot; <b>C</b> copy &middot; <b>R</b> reset &middot; <b>E</b> done' },1600);
    }
  });
})();
