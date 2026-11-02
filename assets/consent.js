/* Climoz consent loader.
   Analytics (Zoho PageSense) and chat (Zoho SalesIQ) load only after the visitor accepts.
   Both are off until their public embed values are filled in below. With both empty,
   this script does nothing: no banner, no cookies, no third-party requests.

   pagesenseSrc: the full script URL from PageSense > Settings > Tracking code,
                 for example "https://cdn.pagesense.io/js/<org>/<project-id>.js"
   salesiqWidgetCode: the "wc" value from the Climoz-branded SalesIQ brand's embed code */
(function(){
  var config={
    pagesenseSrc:'',
    salesiqWidgetCode:''
  };
  if(!config.pagesenseSrc&&!config.salesiqWidgetCode)return;

  var KEY='climoz-consent';
  function read(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function write(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function addScript(src,id){
    if(id&&document.getElementById(id))return;
    var s=document.createElement('script');
    s.src=src;s.defer=true;if(id)s.id=id;
    document.head.appendChild(s);
  }
  function load(){
    if(config.pagesenseSrc)addScript(config.pagesenseSrc,'pagesense-script');
    if(config.salesiqWidgetCode){
      window.$zoho=window.$zoho||{};
      window.$zoho.salesiq=window.$zoho.salesiq||{ready:function(){}};
      addScript('https://salesiq.zohopublic.com/widget?wc='+encodeURIComponent(config.salesiqWidgetCode),'zsiqscript');
    }
  }
  function banner(){
    if(document.querySelector('.consent-bar'))return;
    var bar=document.createElement('div');
    bar.className='consent-bar';
    bar.setAttribute('role','dialog');
    bar.setAttribute('aria-label','Cookie choice');
    bar.innerHTML='<p>We\'d like to use analytics and chat to improve this site. They set cookies and only load if you agree. <a href="/privacy/">Privacy notice</a></p>'+
      '<div class="row"><button type="button" class="btn btn-primary" data-v="accepted">Accept</button><button type="button" class="btn btn-ghost" data-v="declined">Decline</button></div>';
    bar.addEventListener('click',function(e){
      var v=e.target.getAttribute&&e.target.getAttribute('data-v');
      if(!v)return;
      write(v);
      bar.remove();
      if(v==='accepted')load();
    });
    document.body.appendChild(bar);
  }
  function settingsLink(){
    var slot=document.querySelector('[data-consent-link]');
    if(!slot)return;
    slot.innerHTML=' · <button type="button" class="linklike">Cookie settings</button>';
    slot.querySelector('button').addEventListener('click',banner);
  }
  function init(){
    settingsLink();
    var v=read();
    if(v==='accepted')load();
    else if(v!=='declined')banner();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
