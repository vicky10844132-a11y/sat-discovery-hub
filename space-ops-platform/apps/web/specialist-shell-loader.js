(() => {
  'use strict';
  const frame=document.getElementById('frame');
  if(!frame)return;
  const runtimeUrl=new URL('specialist-runtime.js?rev=20260824a',location.href).href;
  function inject(){
    let d;
    try{d=frame.contentDocument}catch(_){return}
    if(!d?.head)return;
    const m=d.location.pathname.toLowerCase().match(/\/(ground|earth|eng)\.html$/);
    if(!m||d.getElementById('spaceops-specialist-runtime'))return;
    const s=d.createElement('script');
    s.id='spaceops-specialist-runtime';
    s.src=runtimeUrl;
    d.head.appendChild(s);
  }
  frame.addEventListener('load',()=>{inject();setTimeout(inject,80);setTimeout(inject,180)});
  inject();
})();