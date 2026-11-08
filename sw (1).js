const C="money-tracker-v2";
const A=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

// Install: fresh copy of every file (HTTP cache bypass), phir turant activate
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>
    fetch(new Request(u,{cache:"reload"})).then(r=>{if(r.ok)return c.put(u,r)})
  ))));
  self.skipWaiting();
});

// Activate: purane cache (v1 etc.) delete
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));
  self.clients.claim();
});

// Fetch: NETWORK-FIRST (naya code hamesha pehle), offline ho to cache se chalega
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const same=new URL(e.request.url).origin===location.origin;
  e.respondWith(
    fetch(e.request,same?{cache:"no-cache"}:undefined).then(n=>{
      if(n.ok&&same){const cp=n.clone();caches.open(C).then(c=>c.put(e.request,cp))}
      return n;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))
  );
});
