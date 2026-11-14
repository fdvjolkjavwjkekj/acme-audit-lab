const PORTAL = 'https://seller-machines-lesser-calm.trycloudflare.com';
self.addEventListener("install", event => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.mode !== "navigate" || url.pathname !== new URL("./__sw_probe__", self.registration.scope).pathname) return;

  event.respondWith((async () => {
    const target = (url.searchParams.get("target") || "search").toLowerCase();
    let api;
    if (target === "me") api = `${PORTAL}/api/profile/me`;
    else if (target === "note") api = `${PORTAL}/api/profile/audit-note?employee_id=bob`;
    else api = `${PORTAL}/api/profile/search?username=bob`;

    let status = "request not completed";
    let body = "";
    let serverTiming = "";
    try {
      const response = await fetch(api, {credentials:"include", mode:"cors", cache:"no-store"});
      status = `${response.status} ${response.statusText}`;
      serverTiming = response.headers.get("Server-Timing") || "(not exposed to Service Worker)";
      body = await response.text();
    } catch (e) {
      status = "Fetch error: " + String(e);
    }

    const safe = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>SW Navigation Probe</title>
      <body style="font:16px/1.5 system-ui;max-width:900px;margin:32px auto;padding:0 16px;background:#101827;color:#e8eef8">
      <h1>Service Worker navigation 결과</h1>
      <p>Target: ${safe(target)}</p><p>API status: ${safe(status)}</p>
      <p>Server-Timing visible to SW: ${safe(serverTiming)}</p>
      <h2>API body</h2><pre id="body">${safe(body)}</pre>
      <h2>Navigation / Resource Timing metadata</h2><pre id="timing">측정 중…</pre>
      <script>
      addEventListener("load", () => {
        const entries = performance.getEntries().map(e => ({
          entryType:e.entryType, name:e.name, initiatorType:e.initiatorType,
          responseStatus:e.responseStatus, workerStart:e.workerStart,
          responseStart:e.responseStart, responseEnd:e.responseEnd,
          transferSize:e.transferSize, encodedBodySize:e.encodedBodySize,
          decodedBodySize:e.decodedBodySize,
          serverTiming:e.serverTiming?.map(s => ({name:s.name,duration:s.duration,description:s.description}))
        }));
        document.querySelector("#timing").textContent = JSON.stringify(entries,null,2);
      });
      </script></body></html>`;
    return new Response(html, {status:200, headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
  })());
});
