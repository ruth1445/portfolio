(function(){
  var mb=document.getElementById('mb');
  [[62.98,59.50],[71.80,62.68],[29.32,51.91],[71.19,65.73]].forEach(function(c){
    var d=document.createElement('span');
    d.style.cssText='position:absolute;left:'+c[0]+'%;top:'+c[1]+'%;width:7px;height:7px;'+
      'margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#0A0A0A;box-shadow:0 0 0 2px #15CF5E';
    mb.appendChild(d)});
})();
