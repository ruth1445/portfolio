/* every scanned object gets the same stack: ink, mottle, dust, lamp banding, scratches */
function skin(inner){
  return '<div class="paper"><div class="ink">'+inner+'</div><div class="lift"></div>'+
         '<div class="spk"></div></div>';
}

/* the paper as an object. run after layout, because the outline is cut in pixels */
function rnd(a,b){ return a+Math.random()*(b-a) }
function paperize(sh){
  var p=sh.querySelector('.paper'), w=sh.offsetWidth, h=sh.offsetHeight;
  if(!w||!h) return;
  // 1. an outline that is cut, not ruled: small drift along each edge, a nick or two,
  //    and corners that are a fraction soft
  var pts=[], N=function(len){ return Math.max(8,Math.round(len/14)) };
  function edge(x0,y0,x1,y1,nx,ny){
    var n=N(Math.hypot(x1-x0,y1-y0)), drift=rnd(-.45,.45);
    for(var i=0;i<n;i++){
      var t=i/n, j=Math.sin(t*Math.PI)*drift + rnd(-.18,.18);
      if(Math.random()<.025) j+=rnd(.35,.8);            // a nick in the cut
      pts.push([x0+(x1-x0)*t + nx*j, y0+(y1-y0)*t + ny*j]);
    }
  }
  var c=rnd(.6,1.6), dog=Math.random()<.35 ? Math.floor(rnd(0,4)) : -1, d=rnd(4,9);
  edge(c,0, w-c,0, 0,1);  edge(w,c, w,h-c, -1,0);
  edge(w-c,h, c,h, 0,-1); edge(0,h-c, 0,c, 1,0);
  if(dog>=0){                                           // a corner turned over
    var cx=[0,w,w,0][dog], cy=[0,0,h,h][dog];
    pts=pts.filter(function(q){ return Math.abs(q[0]-cx)+Math.abs(q[1]-cy)>d });
  }
  p.style.clipPath='polygon('+pts.map(function(q){
    return q[0].toFixed(1)+'px '+q[1].toFixed(1)+'px'}).join(',')+')';

  // 2. light: the platen lamp is even, but a sheet is never quite flat. one edge and
  //    one corner lift and go grey; the rest stays white
  var side=['90deg','270deg','180deg','0deg'][Math.floor(rnd(0,4))];
  var corner=[['0%','0%'],['100%','0%'],['100%','100%'],['0%','100%']][Math.floor(rnd(0,4))];
  sh.querySelector('.lift').style.background=
    'linear-gradient('+side+',rgba(0,0,0,'+rnd(.05,.12).toFixed(2)+'),rgba(0,0,0,0) '+rnd(4,9).toFixed(1)+'%),'+
    'radial-gradient(60% 50% at '+corner[0]+' '+corner[1]+',rgba(0,0,0,'+rnd(.04,.09).toFixed(2)+'),rgba(0,0,0,0) 70%),'+
    'linear-gradient(0deg,rgba(0,0,0,.025),rgba(0,0,0,0) 3%,rgba(0,0,0,0) 97%,rgba(0,0,0,.025))';

  // 3. specks: a few, not a field. mostly dots, the odd hair
  var k=Math.round(rnd(3,9)*(w*h)/(300*420)), sp='';
  for(var i=0;i<Math.max(2,k);i++){
    if(Math.random()<.07){
      sp+='<i class="h" style="left:'+rnd(5,92).toFixed(1)+'%;top:'+rnd(5,92).toFixed(1)+'%;width:'+
          rnd(5,12).toFixed(1)+'px;height:.5px;opacity:'+rnd(.18,.32).toFixed(2)+
          ';transform:rotate('+rnd(-70,70).toFixed(0)+'deg)"></i>';
    }else{
      var z=rnd(.7,2.1);
      sp+='<i style="left:'+rnd(3,96).toFixed(1)+'%;top:'+rnd(3,96).toFixed(1)+'%;width:'+z.toFixed(1)+
          'px;height:'+(z*rnd(.7,1.2)).toFixed(1)+'px;opacity:'+rnd(.45,.85).toFixed(2)+'"></i>';
    }
  }
  sh.querySelector('.spk').innerHTML=sp;

  // 4. a sheet laid by hand is never square to the glass: a hair of keystone
  sh.style.setProperty('--sk',rnd(-.35,.35).toFixed(2)+'deg');
  sh.style.setProperty('--sk2',rnd(-.25,.25).toFixed(2)+'deg');
}

/* ---- the scan: slips and clippings standing proud of the glass ---- */
(function(){
  var s=document.getElementById('slips'), h='';
  var slips=[['P 1–4','Riyadh',5,-1.4,124,300],['P 5–9','Telangana',24,0.9,132,348],
             ['P 10–12','New Brunswick',56,-0.7,128,286],['P 17–20','Lorem ipsum',80,1.6,120,326]];
  slips.forEach(function(x,i){
    h+='<div class="sh slip" data-k="s'+i+'" style="--r:'+x[3]+'deg;left:'+x[2]+'%;width:'+x[4]+
       'px;height:'+(x[5]+58)+'px">'+skin('<em>'+x[1]+'</em>')+'</div>';
  });
  var clips=[[0,15.5,1.1,104,252],[1,40,-1.6,96,302],[2,68,0.8,108,268]];
  clips.forEach(function(c,ci){
    var p=PL[c[0]];
    h+='<div class="sh clip" data-k="c'+ci+'" style="--r:'+c[2]+'deg;left:'+c[1]+'%;width:'+c[3]+
       'px;height:'+(c[4]+58)+'px">'+skin('<img src="'+p[0]+'">')+'</div>';
  });
  s.innerHTML=h;

  document.getElementById('leaves').innerHTML=
    '<img class="doc" data-k="d0" src="img/letter.png" draggable="false" alt="Letter of recommendation" '+
      'style="--r:-1.3deg;left:calc(50% - 512px);top:6px;width:308px">'+
    '<img class="doc" data-k="d1" src="img/letter.png" draggable="false" alt="" '+
      'style="--r:.7deg;left:calc(50% - 154px);top:18px;width:308px">'+
    '<img class="doc" data-k="d2" src="img/letter.png" draggable="false" alt="" '+
      'style="--r:-.5deg;left:calc(50% + 204px);top:0;width:308px">'+
    '<img class="doc" data-k="d3" src="img/passport.png" draggable="false" alt="Passport page, Riyadh" '+
      'style="--r:-3.2deg;left:calc(50% - 138px);top:88px;width:276px;z-index:4">';

  // only the lid's own edge, at the extremes, where a real scan goes black
  document.getElementById('bars').innerHTML=
    '<i style="left:0;top:0;bottom:0;width:9px"></i>'+
    '<i style="right:0;top:0;bottom:0;width:7px"></i>';
})();

document.querySelectorAll('.scan .sh').forEach(paperize);
addEventListener('resize',function(){ document.querySelectorAll('.scan .sh').forEach(paperize) });
