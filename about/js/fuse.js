/* the github year as a living thing: grey days dissolve, green days fuse like cell
   division played backwards, then it all comes apart again. drawn at 10 frames a
   second with fresh grain on every frame, the same way the thought-opsy scan moves. */
(function(){
  var L=4.8, FPS=10, HALF=5, FALL=9;           // loop length (s), frame rate, half a square, field reach
  var T=Math.pow(1-HALF/FALL,2);                // field level that marks a cell's edge
  var cur=null;

  function hex(c){c=parseInt(c.slice(1),16);return[(c>>16)&255,(c>>8)&255,c&255]}
  function ss(a,b,x){x=(x-a)/(b-a);x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
  function ease(x){return .5-.5*Math.cos(Math.PI*x)}

  /* where the loop is: 0 = github grid, 1 = fully fused */
  function phase(t){
    t%=L;
    if(t<.3) return 0;
    if(t<2.2) return ease((t-.3)/1.9);
    if(t<2.6) return 1;
    if(t<4.5) return 1-ease((t-2.6)/1.9);
    return 0;
  }

  /* group nearby green days, and decide the order in which they fuse (closest first) */
  function plan(leaves,P){
    var reach=2.4*P, groups=leaves.map(function(l,i){return{ids:[i],x:l.cx,y:l.cy,n:1}}), nodes=[];
    for(;;){
      var best=-1,bi=0,bj=0;
      for(var i=0;i<groups.length;i++)for(var j=i+1;j<groups.length;j++){
        var a=groups[i],b=groups[j],near=1e9;
        for(var p=0;p<a.ids.length;p++)for(var q=0;q<b.ids.length;q++){
          var la=leaves[a.ids[p]],lb=leaves[b.ids[q]],d=Math.hypot(la.cx-lb.cx,la.cy-lb.cy);
          if(d<near)near=d;
        }
        if(near>reach) continue;
        var dc=Math.hypot(a.x-b.x,a.y-b.y);
        if(best<0||dc<best){best=dc;bi=i;bj=j}
      }
      if(best<0) break;
      var A=groups[bi],B=groups[bj],n=A.n+B.n,
          M={ids:A.ids.concat(B.ids),n:n,x:(A.x*A.n+B.x*B.n)/n,y:(A.y*A.n+B.y*B.n)/n,root:0};
      nodes.push(M); groups.splice(bj,1); groups[bi]=M;
    }
    /* each group's merges spread evenly over the fusing time */
    groups.forEach(function(g){
      var mine=nodes.filter(function(m){return m.ids.length<=g.ids.length&&m.ids.every(function(id){return g.ids.indexOf(id)>=0})});
      mine.forEach(function(m,k){m.tau=(k+1)/mine.length});
    });
    leaves.forEach(function(l,i){
      l.path=[{x:l.cx,y:l.cy,tau:0}];
      nodes.forEach(function(m){
        if(m.ids.indexOf(i)<0) return;
        var k=.3+.26/Math.sqrt(m.n);
        l.path.push({x:m.x+k*(l.cx-m.x),y:m.y+k*(l.cy-m.y),tau:m.tau});
      });
      l.path.sort(function(a,b){return a.tau-b.tau});
    });
  }

  function where(l,m){
    var p=l.path, j=1;
    while(j<p.length&&p[j].tau<=m) j++;
    if(j>=p.length) return p[p.length-1];
    var a=p[j-1],b=p[j],f=ease((m-a.tau)/(b.tau-a.tau));
    return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};
  }

  window.ghFuse=function(host,g){
    if(cur){cur.stop();cur=null}
    if(!host.getContext && !document.createElement('canvas').getContext) return;
    var M=8, X0=g.LEFT-M, Y0=g.TOP-M, CW=g.cols*g.P-(g.P-g.CS)+2*M, CH=7*g.P-(g.P-g.CS)+2*M;
    var cv=document.createElement('canvas'), ctx=cv.getContext('2d');
    if(!ctx) return;
    cv.setAttribute('aria-hidden','true');
    cv.style.cssText='position:absolute;pointer-events:none;left:'+(X0/g.W*100)+'%;top:'+(Y0/g.H*100)+
      '%;width:'+(CW/g.W*100)+'%;height:'+(CH/g.H*100)+'%';
    host.style.position='relative';
    host.appendChild(cv);

    var greys=[], leaves=[];
    g.cells.forEach(function(c){
      var o={cx:c.x+g.CS/2,cy:c.y+g.CS/2,lv:c.lv,col:hex(g.COL[c.lv])};
      (c.lv>0?leaves:greys).push(o);
    });
    plan(leaves,g.P);

    var noise=new Uint8Array(262144);
    for(var i=0;i<262144;i++) noise[i]=Math.max(0,Math.min(255,((Math.random()+Math.random()+Math.random())/3-.5)*2.4*128+128))|0;
    var grey=hex(g.COL[0]);

    var stamp=null,stampS=0,S=0,OW=0,OH=0,img,out,F,RW,GW,BW,WS,lastStep=-1,raf=0,seen=true,dead=false,io=null,t0=performance.now();

    function alloc(){
      var cssW=cv.clientWidth||CW, s=cssW/CW*Math.min(window.devicePixelRatio||1,2);
      if(CW*CH*s*s>900000) s=Math.sqrt(900000/(CW*CH));
      if(Math.abs(s-S)<.01&&img) return;
      S=s; OW=Math.round(CW*S); OH=Math.round(CH*S);
      cv.width=OW; cv.height=OH;
      img=ctx.createImageData(OW,OH); out=new Uint32Array(img.data.buffer);
      F=new Float32Array(OW*OH); RW=new Float32Array(OW*OH); GW=new Float32Array(OW*OH);
      BW=new Float32Array(OW*OH); WS=new Float32Array(OW*OH);
    }

    function render(u){
      alloc();
      out.fill(0); F.fill(0); RW.fill(0); GW.fill(0); BW.fill(0); WS.fill(0);
      var nOff=(Math.random()*262144)|0, mask=262143;
      var grain=.2+.16*u, k, x, y, o;

      /* grey days: flat at rest, then they fall away grain by grain */
      var ga=1-ss(0,.55,u), cut=(1-ga)*255;
      if(ga>0){
        var rr=2*S, hh=HALF*S;
        /* one square's coverage, worked out once per size and stamped for every grey day */
        var sw=Math.ceil(2*hh)+2;
        if(!stamp||stampS!==S){
          stamp=new Float32Array(sw*sw); stampS=S;
          for(y=0;y<sw;y++)for(x=0;x<sw;x++){
            var qx=Math.abs(x+.5-sw/2)-(hh-rr), qy=Math.abs(y+.5-sw/2)-(hh-rr), mx=qx>0?qx:0, my=qy>0?qy:0;
            var sd=Math.sqrt(mx*mx+my*my)+Math.min(Math.max(qx,qy),0)-rr;
            stamp[y*sw+x]=sd>.5?0:Math.min(1,.5-sd);
          }
        }
        var gk=255*(ga<1?.55+.45*ga:1), gn=grain*.35;
        for(k=0;k<greys.length;k++){
          var gc=greys[k], sx=Math.round((gc.cx-X0)*S-sw/2), sy=Math.round((gc.cy-Y0)*S-sw/2);
          for(var j=0;j<sw;j++){
            y=sy+j; if(y<0||y>=OH) continue;
            for(var i2=0;i2<sw;i2++){
              x=sx+i2; var cov=stamp[j*sw+i2]; if(cov<=0||x<0||x>=OW) continue;
              o=y*OW+x; var n=noise[(o*7+nOff)&mask];
              if(n<cut) continue;
              var a=gk*cov, nz=(n-128)*gn;
              var r=grey[0]+nz,gg=grey[1]+nz,b=grey[2]+nz;
              r=r<0?0:r>255?255:r; gg=gg<0?0:gg>255?255:gg; b=b<0?0:b>255?255:b;
              out[o]=((a<<24)|(b<<16)|(gg<<8)|r)>>>0;
            }
          }
        }
      }

      /* green days as soft cells: a field around each, summed, so close ones grow a neck and fuse */
      var rc=2+3*ss(0,.25,u), m=Math.max(0,Math.min(1,(u-.1)/.9)), jit=.15+.55*u;
      var bx0=OW,bx1=0,by0=OH,by1=0;
      for(k=0;k<leaves.length;k++){
        var l=leaves[k], p=where(l,m);
        var cx=(p.x+(Math.random()-.5)*jit-X0)*S, cy=(p.y+(Math.random()-.5)*jit-Y0)*S;
        var br=1+(Math.random()-.5)*(.03+.06*u);
        var h=HALF*S, rS=rc*S, fall=FALL*S, reach=(FALL-HALF)*S+h;
        var x0=Math.max(0,Math.floor(cx-reach)), x1=Math.min(OW,Math.ceil(cx+reach)),
            y0=Math.max(0,Math.floor(cy-reach)), y1=Math.min(OH,Math.ceil(cy+reach));
        if(x0<bx0)bx0=x0; if(x1>bx1)bx1=x1; if(y0<by0)by0=y0; if(y1>by1)by1=y1;
        var cr=l.col[0]*br, cg=l.col[1]*br, cb=l.col[2]*br;
        for(y=y0;y<y1;y++){
          var qy=Math.abs(y+.5-cy)-(h-rS);
          for(x=x0;x<x1;x++){
            var qx=Math.abs(x+.5-cx)-(h-rS);
            var mx=qx>0?qx:0, my=qy>0?qy:0, sd=Math.sqrt(mx*mx+my*my)+Math.min(Math.max(qx,qy),0)-rS;
            var f=1-(sd+h)/fall; if(f<=0) continue;
            f*=f; o=y*OW+x; F[o]+=f;
            var w=f*f; RW[o]+=w*cr; GW[o]+=w*cg; BW[o]+=w*cb; WS[o]+=w;
          }
        }
      }

      var rimK=.22*ss(0,.35,u), halo=.25+.75*u, aa=1.2/S;
      for(y=by0;y<by1;y++)for(x=bx0;x<bx1;x++){
        o=y*OW+x; var v=F[o]; if(v<T*.4) continue;
        var n=noise[(o*7+nOff)&mask], nz=(n-128)*grain;
        var r=RW[o]/WS[o], gg=GW[o]/WS[o], b=BW[o]/WS[o], a;
        if(v>=T){
          /* edge in field units, roughly one device pixel wide */
          a=Math.min(1,(v-T)/(T*aa)+.5)*255;
          var rim=1-rimK*(1-ss(T,T*2.4,v));
          r=r*rim+nz; gg=gg*rim+nz; b=b*rim+nz; a+=nz*.5;
        }else{
          /* a thin noisy membrane of signal around each cell, like the floor around the scan */
          var q=(v/T-.4)/.6; q*=q;
          if(n*q*halo<120) continue;
          a=(n*q*halo-120)*1.6; r+=nz; gg+=nz; b+=nz;
        }
        r=r<0?0:r>255?255:r; gg=gg<0?0:gg>255?255:gg; b=b<0?0:b>255?255:b; a=a<0?0:a>255?255:a;
        out[o]=((a<<24)|(b<<16)|(gg<<8)|r)>>>0;
      }
      ctx.putImageData(img,0,0);
    }

    function loop(now){
      raf=0;
      if(!seen) return;
      var t=(now-t0)/1000, step=Math.floor(t*FPS);
      if(step!==lastStep){lastStep=step; render(phase(step/FPS));}
      raf=requestAnimationFrame(loop);
    }
    function go(){ if(!raf&&seen&&!dead) raf=requestAnimationFrame(loop) }

    host.classList.add('alive');
    var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(still){ render(0); }
    else{
      if('IntersectionObserver' in window){
        io=new IntersectionObserver(function(e){seen=e[0].isIntersecting; go()}); io.observe(host);
      }
      go();
    }
    window.addEventListener('resize',function(){lastStep=-1});
    cur={stop:function(){dead=true; seen=false; if(io)io.disconnect(); if(raf)cancelAnimationFrame(raf); cv.remove(); host.classList.remove('alive')},
         at:function(u){render(u)}};
    window.__ghFuse=cur;
  };
})();
