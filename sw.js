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
  let response;
  try{
   const r=await fetch(PORTAL+path,{mode:"cors",credentials:"include",cache:"no-store"});
   response=r;
  }catch(e){
   response=new Response(JSON.stringify({kind,path,error:String(e)}),{
    status:502,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}
   });
  }
  return response;
 })());
});
