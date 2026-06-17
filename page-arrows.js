(function(){
  var pages=[
    {file:'homepage-v1.html',label:'Home'},
    {file:'input-center.html',label:'Input Center'},
    {file:'aoi-tools.html',label:'AOI Tools'},
    {file:'production-toolkit.html',label:'Production Toolkit'},
    {file:'job-builder.html',label:'Job Builder'},
    {file:'progress-monitor.html',label:'Progress Monitor'},
    {file:'preview-qc.html',label:'Preview & QC'},
    {file:'output-center.html',label:'Output Center'},
    {file:'production-intelligence.html',label:'Production Intelligence'},
    {file:'tle-report.html',label:'Orbit Prediction'},
    {file:'disclaimer.html',label:'Source & Disclaimer'}
  ];
  var path=window.location.pathname.split('/').pop()||'homepage-v1.html';
  if(path==='index.html') path='homepage-v1.html';
  var idx=pages.findIndex(function(p){return p.file===path;});
  if(idx<0) return;
  var prev=pages[idx-1];
  var next=pages[idx+1];
  var css=document.createElement('style');
  css.textContent='.sd-page-arrows{position:relative;z-index:50;max-width:1120px;margin:14px auto 0;padding:0 28px;display:flex;justify-content:space-between;gap:12px}.sd-page-arrows a,.sd-page-arrows span{display:inline-flex;align-items:center;gap:8px;border:1px solid #214e71;background:#091827;color:#dff4ff;text-decoration:none;border-radius:999px;padding:9px 13px;font:800 12px Inter,Arial,sans-serif;box-shadow:0 10px 28px #0005}.sd-page-arrows a:hover{border-color:#34d8ff;color:#34d8ff}.sd-page-arrows span{opacity:.38;cursor:not-allowed}.sd-page-arrows .sd-next{margin-left:auto}@media(max-width:620px){.sd-page-arrows{padding:0 18px}.sd-page-arrows a,.sd-page-arrows span{font-size:11px;padding:8px 10px}}';
  document.head.appendChild(css);
  var wrap=document.createElement('div');
  wrap.className='sd-page-arrows';
  wrap.innerHTML=(prev?'<a class="sd-prev" href="'+prev.file+'">← Previous: '+prev.label+'</a>':'<span class="sd-prev">← Previous</span>')+(next?'<a class="sd-next" href="'+next.file+'">Next: '+next.label+' →</a>':'<span class="sd-next">Next →</span>');
  var header=document.querySelector('header');
  if(header&&header.parentNode){header.parentNode.insertBefore(wrap,header.nextSibling);}else{document.body.insertBefore(wrap,document.body.firstChild);}
})();
