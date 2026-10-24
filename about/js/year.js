(function(){
  /* her year on github. data/contributions.json is refreshed every morning by
     .github/workflows/contributions.yml; the string below is only a fallback */
  var SNAP={year:2026,start:Date.UTC(2025,11,28),D:"....00000100000000000000000000000000000000000000000000000000000000000000000000000000000000000011001001101100000000000000000000000000000000000000000000000000000000000000000000000001011211000110000000110000000000000000100100000000000000000000011120110223011010011121141110004410000010022202422100011000000000000000000000000000000000000000000000000000000000000000000000000.."};
  var COL=['#EFF2F5','#ACEEBB','#4AC26B','#2DA44E','#116329'];
  var CS=10, P=13, LEFT=33, TOP=20, DAY=86400000;
  var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var el=document.getElementById('cal'); if(!el) return;

  function iso(t){return new Date(t).toISOString().slice(0,10)}

  function draw(year, level){
    var jan1=Date.UTC(year,0,1), dec31=Date.UTC(year,11,31);
    var start=jan1-new Date(jan1).getUTCDay()*DAY;
    var cols=Math.floor((dec31-start)/DAY/7)+1, sv='', lab='', seen={}, cells=[];
    for(var c=0;c<cols;c++){
      var sun=new Date(start+c*7*DAY);
      if(sun.getUTCFullYear()===year && !seen[sun.getUTCMonth()]){
        seen[sun.getUTCMonth()]=1;
        lab+='<text x="'+(LEFT+c*P)+'" y="12" font-size="12" fill="#1F2328">'+MO[sun.getUTCMonth()]+'</text>';
      }
      for(var r=0;r<7;r++){
        var t=start+(c*7+r)*DAY; if(t<jan1||t>dec31) continue;
        var d=iso(t), v=level(d);
        cells.push({x:LEFT+c*P,y:TOP+r*P,lv:v});
        sv+='<rect data-date="'+d+'" x="'+(LEFT+c*P)+'" y="'+(TOP+r*P)+'" width="'+CS+'" height="'+CS+'" rx="2" ry="2" fill="'+COL[v]+
            '" stroke="rgba(31,35,40,.05)" stroke-width="1"/>';
      }
    }
    ['Mon','Wed','Fri'].forEach(function(n,i){
      lab+='<text x="0" y="'+(TOP+(1+i*2)*P+9)+'" font-size="12" fill="#1F2328">'+n+'</text>'});
    var W=LEFT+cols*P-(P-CS), LY=TOP+7*P+22, H=LY+CS;   /* room under the grid for the block title */
    /* legend, inside the same drawing so it grows with the grid */
    var x=W-31, leg='<text x="'+W+'" y="'+(LY+9)+'" font-size="12" fill="#59636E" text-anchor="end">More</text>';
    for(var k=4;k>=0;k--){x-=CS+(k===4?2:3);
      leg+='<rect x="'+x+'" y="'+LY+'" width="'+CS+'" height="'+CS+'" rx="2" ry="2" fill="'+COL[k]+'" stroke="rgba(31,35,40,.05)" stroke-width="1"/>'}
    leg+='<text class="leg" x="'+(x-5)+'" y="'+(LY+9)+'" font-size="12" fill="#59636E" text-anchor="end">Less</text>';
    el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Noto Sans,Helvetica,Arial,sans-serif">'+lab+sv+leg+'</svg>';
    if(window.ghFuse) window.ghFuse(el,{W:W,H:H,cols:cols,cells:cells,LEFT:LEFT,TOP:TOP,P:P,CS:CS,COL:COL});
  }

  function snapshot(){
    draw(SNAP.year,function(d){
      var i=Math.round((Date.parse(d)-SNAP.start)/DAY), v=SNAP.D.charAt(i);
      return v>='0'&&v<='4' ? +v : 0;
    });
  }

  snapshot();
  if(window.fetch) fetch('data/contributions.json',{cache:'no-cache'})
    .then(function(r){if(!r.ok) throw r.status; return r.json()})
    .then(function(j){
      draw(j.year,function(d){var x=j.days[d]; return x ? Math.max(0,Math.min(4,x[0])) : 0});
    })
    .catch(function(){});
})();
