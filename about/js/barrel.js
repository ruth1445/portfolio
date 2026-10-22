var wheels=[], BANDS=7, ARC=84;
(function(){
  var el=document.querySelector('[data-c="wheel"]');
  var NB=+el.dataset.bands||BANDS;               // a larger drum needs finer facets
  var H=+el.dataset.h, BH=H/NB, R=H/(ARC*Math.PI/180);
  el.className='win';
  el.style.setProperty('--h',H+'px'); el.style.setProperty('--h7',BH.toFixed(2)+'px');
  el.style.setProperty('--pw',el.dataset.pw+'px'); el.style.setProperty('--fs',el.dataset.fs+'px');
  el.style.setProperty('--wh',el.dataset.wh+'px');
  var dial=document.createElement('div'); dial.className='dial'; var bands=[];
  PL.forEach(function(p,j){
    for(var k=0;k<NB;k++){
      var b=document.createElement('div'); b.className='bdd';
      b.innerHTML='<div class="lb" style="top:'+(-k*BH+2.5).toFixed(2)+'px">'+
        '<span class="pic"><img src="'+p[0]+'"></span>'+
        '<span class="tx"><b>'+p[1]+'</b><em>'+p[2]+'</em></span></div>';
      dial.appendChild(b); bands.push({el:b,a:j*90+((NB-1)/2-k)*(ARC/NB)});
    }
  });
  el.appendChild(dial);
  var ft=document.createElement('div'); ft.className='fade t';
  var fb=document.createElement('div'); fb.className='fade b';
  el.appendChild(ft); el.appendChild(fb);
  var hold=false;
  el.addEventListener('pointerenter',function(){hold=true});
  el.addEventListener('pointerleave',function(){hold=false});
  wheels.push({bands:bands,R:R,h:function(){return hold}});
})();
var DW=.42, PER=3.2, t=0, last=0;
function ease(p){p=(p-DW)/(1-DW);return p<=0?0:p>=1?1:p*p*p*(p*(p*6-15)+10)}
function dease(p){p=(p-DW)/(1-DW);return (p<=0||p>=1)?0:30*p*p*(p-1)*(p-1)/(1-DW)}
requestAnimationFrame(function fr(now){
  if(!last)last=now; var dt=Math.min((now-last)/1000,1/30); last=now;
  if(wheels.some(function(w){return !w.h()})) t+=dt/PER;
  var w0=Math.floor(t), p=t-w0, e=ease(p), v=dease(p)/3.2, spin=(w0+e)*90;
  wheels.forEach(function(W){
    W.bands.forEach(function(b){
      var th=b.a-spin, c=Math.cos(th*Math.PI/180);
      b.el.style.transform='rotateX('+th.toFixed(2)+'deg) translateZ('+W.R.toFixed(1)+'px)';
      if(c>=0){ b.el.style.opacity=Math.min(1,0.28+1.25*c).toFixed(3);
        b.el.style.filter='brightness('+(0.82+0.18*c).toFixed(3)+') blur('+(v*1.1).toFixed(2)+'px)';
      }else{ b.el.style.opacity=(0.12*(-c)).toFixed(3);
        b.el.style.filter='blur('+(1.6+v).toFixed(2)+'px)'; }
    });
  });
  requestAnimationFrame(fr);
});
