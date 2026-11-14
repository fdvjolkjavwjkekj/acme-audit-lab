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
   if(typeof performance!=="undefined")performance.clearResourceTimings?.();
   const r=await fetch(PORTAL+path,{mode:"cors",credentials:"include",cache:"no-store"});
   result.status=r.status;result.ok=r.ok;
   result.serverTiming=r.headers.get("Server-Timing");
   result.exposed=r.headers.get("Access-Control-Expose-Headers");
   if(typeof performance!=="undefined"){
    result.fetchPerformance=performance.getEntriesByName(PORTAL+path).map(e=>({
     entryType:e.entryType,initiatorType:e.initiatorType,duration:e.duration,
     requestStart:e.requestStart,responseStart:e.responseStart,responseEnd:e.responseEnd,
     transferSize:e.transferSize,encodedBodySize:e.encodedBodySize,decodedBodySize:e.decodedBodySize,
     responseStatus:e.responseStatus,
     serverTiming:e.serverTiming?.map(s=>({name:s.name,duration:s.duration,description:s.description}))
    }));
   }
   await r.body?.cancel();
  }catch(e){result.error=String(e);}
  return r;
 })());
});
