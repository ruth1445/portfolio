/* the language map, redrawn as soft pixels (neighbouring pixels melt into each other)
   with rings of dots pulsing out of the places my languages come from */
(function(){
  var mb=document.getElementById('mb'), src=document.getElementById('world');
  if(!mb||!src) return;
  var VB=[0,-125,960,545], COLS=176;
  var SEA='#A00000';
  var FILL={muted:'#8A0505', getby:'#6F6556', easy:'#958A78', local:'#D4C9B2'};
  var KEY=['muted','getby','easy','local'];
  var RING=[241,231,211];

  /* x is plain longitude; y was fitted to the old pins (NJ, Riyadh, Hyderabad, Kerala) */
  function at(lat,lon){
    var x=(lon+180)/360*VB[2];
    var r=lat*Math.PI/180, m=1.25*Math.log(Math.tan(Math.PI/4+.4*r));
    return [x, 255.4-127.6*m];
  }
  /* [lat, lon, strength 1-3] */
  var HOT=[
    [24.7,46.7,3],   // arabic: riyadh
    [30.0,31.2,2],   // arabic: cairo
    [28.6,77.2,3],   // hindi: delhi
    [10.0,76.3,3],   // malayalam: kerala
    [17.4,78.5,2],   // telugu: hyderabad
    [31.5,74.3,1],   // urdu: lahore
    [13.1,80.3,1],   // tamil: chennai
    [51.5,-0.1,3],   // english: london
    [40.5,-74.4,3],  // english: new jersey
    [-33.9,151.2,2]  // english: sydney
  ];

  var ROWS=Math.round(COLS*VB[3]/VB[2]), CU=VB[2]/COLS;   // cell size in map units
  var grid=new Int8Array(COLS*ROWS).fill(-1);

  /* rasterise the svg map once, sampling each cell, and keep the class that covers most of it */
  function classify(done){
    var S=4, cols={muted:'#ff0000',getby:'#00ff00',easy:'#0000ff',local:'#ffffff'};
    var css='path{stroke:none}'+KEY.map(function(k){return '.'+k+'{fill:'+cols[k]+'}'}).join('');
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+COLS*S+'" height="'+ROWS*S+'" viewBox="'+VB.join(' ')+
      '" preserveAspectRatio="none"><style>'+css+'</style>'+src.innerHTML+'</svg>';
    var im=new Image();
    im.onload=function(){
      var c=document.createElement('canvas'); c.width=COLS*S; c.height=ROWS*S;
      var x=c.getContext('2d'); x.drawImage(im,0,0);
      var d=x.getImageData(0,0,c.width,c.height).data;
      for(var r=0;r<ROWS;r++)for(var q=0;q<COLS;q++){
        var n=[0,0,0,0], land=0;
        for(var j=0;j<S;j++)for(var i=0;i<S;i++){
          var o=((r*S+j)*c.width+q*S+i)*4; if(d[o+3]<128) continue; land++;
          var R=d[o],G=d[o+1],B=d[o+2];
          if(R>200&&G>200&&B>200) n[3]++; else if(R>=G&&R>=B) n[0]++; else if(G>=B) n[1]++; else n[2]++;
        }
        if(land*2<S*S) continue;
        /* any trace of a language country wins over the muted land around it */
        var best=0; for(var k=1;k<4;k++) if(n[k]*3>=land&&n[k]>=n[best]) best=k;
        if(best===0&&(n[1]||n[2]||n[3])&&n[0]<land*.6){best=n[3]>=n[2]&&n[3]>=n[1]?3:n[2]>=n[1]?2:1}
        grid[r*COLS+q]=best;
      }
      done();
    };
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  var cv=document.createElement('canvas'), ctx=cv.getContext('2d'), base=document.createElement('canvas');
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block';
  var W=0,H=0,cs=0,raf=0,seen=true,last=-1,t0=performance.now();

  function g(q,r){return q<0||r<0||q>=COLS||r>=ROWS?-1:grid[r*COLS+q]}
  /* layer 0 is all land, so where two kinds of land meet the gap shows land, not sea */
  function is(q,r,k){var v=g(q,r); return k===0?v>=0:v===k}

  /* soft pixels: a pixel's outside corners round off, and inside corners get filled in */
  function paint(x){
    x.fillStyle=SEA; x.fillRect(0,0,W,H);
    var h=cs/2, DIR=[[-1,-1],[1,-1],[1,1],[-1,1]];
    for(var k=0;k<4;k++){
      x.fillStyle=FILL[KEY[k]]; x.beginPath();
      for(var r=0;r<ROWS;r++)for(var q=0;q<COLS;q++){
        var me=is(q,r,k), cx=(q+.5)*cs, cy=(r+.5)*cs;
        for(var d=0;d<4;d++){
          var dx=DIR[d][0], dy=DIR[d][1], a=is(q+dx,r,k), b=is(q,r+dy,k);
          var qx=cx+(dx<0?-h:0), qy=cy+(dy<0?-h:0);
          if(me){
            if(!a&&!b){ x.moveTo(cx,cy); x.arc(cx,cy,h+.35,Math.atan2(dy,0),Math.atan2(0,dx),dx*dy>0); x.closePath(); }
            else x.rect(qx-.2,qy-.2,h+.4,h+.4);
          }else if(a&&b&&is(q+dx,r+dy,k)){
            var px=cx+dx*h, py=cy+dy*h;
            x.moveTo(px,py); x.lineTo(px,cy); x.arc(cx,cy,h,Math.atan2(0,dx),Math.atan2(dy,0),dx*dy<0); x.closePath();
          }
        }
      }
      x.fill();
    }
  }

  function size(){
    var w=mb.clientWidth, dpr=Math.min(window.devicePixelRatio||1,2);
    var nw=Math.round(w*dpr), nh=Math.round(w*VB[3]/VB[2]*dpr);
    if(nw===W&&nh===H) return;
    W=cv.width=base.width=nw; H=cv.height=base.height=nh; cs=W/COLS;
    paint(base.getContext('2d')); last=-1;
  }

  var PER=2.6, FPS=12;
  function frame(t){
    size();
    ctx.drawImage(base,0,0);
    var hs=HOT.map(function(p,i){var xy=at(p[0],p[1]);
      return {q:(xy[0]-VB[0])/CU, r:(xy[1]-VB[1])/CU, s:p[2], ph:((t/PER)+i*.37)%1}});
    var dot=cs*.36;
    ctx.fillStyle='rgb('+RING.join(',')+')';
    for(var r=0;r<ROWS;r++)for(var q=0;q<COLS;q++){
      var v=0;
      for(var k=0;k<hs.length;k++){
        var h=hs[k], dx=q+.5-h.q, dy=r+.5-h.r, dist=Math.sqrt(dx*dx+dy*dy), maxR=4+h.s*5.5;
        if(dist<1.1){v=Math.max(v,1);continue}
        for(var n=0;n<2;n++){                       // two rings out at a time
          var ph=(h.ph+n*.5)%1, rad=ph*maxR, band=Math.abs(dist-rad);
          if(band<.55&&dist<=maxR) v=Math.max(v,(1-ph)*(.45+.18*h.s));
        }
      }
      if(v<.12) continue;
      var lv=v>.66?1:v>.38?.62:.32;                  // three steps of brightness, pixel style
      ctx.globalAlpha=lv;
      ctx.beginPath(); ctx.arc((q+.5)*cs,(r+.5)*cs,dot,0,6.2832); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  function loop(now){
    raf=0; if(!seen) return;
    var t=(now-t0)/1000, step=Math.floor(t*FPS);
    if(step!==last){last=step; frame(step/FPS)}
    raf=requestAnimationFrame(loop);
  }
  function go(){ if(!raf&&seen) raf=requestAnimationFrame(loop) }

  classify(function(){
    mb.appendChild(cv); mb.classList.add('pix');
    var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    size();
    if(still){ frame(0); return }
    if('IntersectionObserver' in window) new IntersectionObserver(function(e){seen=e[0].isIntersecting; go()}).observe(mb);
    window.addEventListener('resize',function(){last=-1});
    go();
  });
  window.__map={frame:function(t){size();frame(t)}};
})();
