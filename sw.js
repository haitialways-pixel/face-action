const C='fa-v50',A=['./','index.html','art/hero.webp','manifest.webmanifest','privacy.html','icons/icon-192.png','icons/icon-512.png','icons/favicon-32.png','favicon.ico'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
// only clean up this game's own old caches (the github.io origin is shared with Falling Bricks, whose caches start with 'fb-')
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('fa-')&&x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// network-first for the page itself so updates show up; cache-first for everything else
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  const save=res=>{if(res.ok&&(u.href.includes('mediapipe')||u.origin===self.location.origin)){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl))}return res};
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(save).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(save)))});
