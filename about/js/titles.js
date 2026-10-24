/* sit every block title on its base line. the line is either a baseline already in the
   block (the legend, a link) or a set distance above the block's bottom edge. */
(function(){
  var T=[].slice.call(document.querySelectorAll('.btl'));
  T.forEach(function(t){ var m=document.createElement('i'); m.className='bl'; t.appendChild(m); });

  function baseOf(el){
    if(el instanceof SVGTextElement){
      var svg=el.ownerSVGElement, m=svg.getScreenCTM(), y=+el.getAttribute('y');
      return m.f+y*m.d;
    }
    var mk=document.createElement('i'); mk.className='bl'; mk.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(mk); var b=mk.getBoundingClientRect().top; el.removeChild(mk); return b;
  }

  function place(){
    T.forEach(function(t){
      if(!t.dataset.on&&!t.dataset.pad) return;
      var sec=t.parentElement, sr=sec.getBoundingClientRect(), line;
      if(t.dataset.on){ var el=document.querySelector(t.dataset.on); if(!el) return; line=baseOf(el); }
      else line=sr.bottom-(+t.dataset.pad||34);
      t.style.top='0px';
      var own=t.querySelector('i.bl').getBoundingClientRect().top-t.getBoundingClientRect().top;
      t.style.top=(line-sr.top-own)+'px';
    });
  }
  place();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(place);
  window.addEventListener('load',place);
  window.addEventListener('resize',place);
  setTimeout(place,1500);
  window.__titles=place;
})();
