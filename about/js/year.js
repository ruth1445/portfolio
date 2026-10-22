(function(){
  /* her 2026, read cell by cell from github: 53 weeks of Sun..Sat, '.' where no day exists */
  var D="....00000100000000000000000000000000000000000000000000000000000000000000000000000000000000000011001001101100000000000000000000000000000000000000000000000000000000000000000000000001011211000110000000110000000000000000100100000000000000000000011120110223011010011121141110004410000010022202422100011000000000000000000000000000000000000000000000000000000000000000000000000..";
  var COL=['#EFF2F5','#ACEEBB','#4AC26B','#2DA44E','#116329'];
  var CS=10, P=13, LEFT=33, TOP=20;
  var start=Date.UTC(2025,11,28), sv='', lab='', seen={};
  var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for(var c=0;c<53;c++){
    var sun=new Date(start+c*7*86400000);
    if(sun.getUTCFullYear()===2026 && !seen[sun.getUTCMonth()]){
      seen[sun.getUTCMonth()]=1;
      lab+='<text x="'+(LEFT+c*P)+'" y="12" font-size="12" fill="#1F2328">'+MO[sun.getUTCMonth()]+'</text>';
    }
    for(var r=0;r<7;r++){
      var v=D.charAt(c*7+r); if(v==='.') continue;
      sv+='<rect x="'+(LEFT+c*P)+'" y="'+(TOP+r*P)+'" width="'+CS+'" height="'+CS+'" rx="2" ry="2" fill="'+COL[+v]+
          '" stroke="rgba(31,35,40,.05)" stroke-width="1"/>';
    }
  }
  ['Mon','Wed','Fri'].forEach(function(n,i){
    lab+='<text x="0" y="'+(TOP+(1+i*2)*P+9)+'" font-size="12" fill="#1F2328">'+n+'</text>'});
  var W=LEFT+53*P, H=TOP+7*P;
  document.getElementById('cal').innerHTML='<svg viewBox="0 0 '+W+' '+H+'" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Noto Sans,Helvetica,Arial,sans-serif">'+lab+sv+'</svg>';
})();
