/* ตัวจิ๋ว – Service Worker (ใช้งานออฟไลน์) */
const CACHE = 'tuajiw-v19';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/store.js',
  './js/app.js',
  './js/diary.js',
  './js/views/diary.js',
  './js/data/vaccines.js',
  './js/data/growth.js',
  './js/data/milestones.js',
  './js/data/content.js',
  './js/data/pregnancy.js',
  './js/data/checklists.js',
  './js/data/tips.js',
  './js/data/feeding.js',
  './js/data/provinces.js',
  './js/data/prices.js',
  './js/data/insurance.js',
  './js/data/fruitart.js',
  './js/data/babycost.js',
  './js/data/groups.js',
  './js/data/sources.js',
  './js/lib/supabase.js',
  './js/data/supabase-config.js',
  './js/cloud.js',
  './js/views/home.js',
  './js/views/pregnancy.js',
  './js/views/log.js',
  './js/views/vaccines.js',
  './js/views/growth.js',
  './js/views/develop.js',
  './js/views/settings.js',
  './js/views/appt.js',
  './js/views/prices.js',
  './js/views/insurance.js',
  './js/views/babycost.js',
  './js/views/groups.js',
  './js/views/plan.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    // {cache:'reload'} = โหลดไฟล์สดข้าม HTTP cache (กันได้ไฟล์เก่าตอนอัปเดต)
    caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // network-first: ออนไลน์ได้ของใหม่เสมอ, ออฟไลน์ค่อยใช้แคช
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
