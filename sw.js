/* ตัวจิ๋ว – Service Worker (โหมดปิดตัวเอง)
   เหตุผล: SW เดิมทำให้มือถือบางเครื่องค้างที่ "แคชเก่า/ไฟล์ปนรุ่น" (โหลดไม่ครบ หน้าไม่ขึ้น)
   ตัวนี้จะ "ล้างแคชทั้งหมด + เลิกใช้ SW + รีโหลดหน้า" ให้อัตโนมัติ → ทุกเครื่องกลับมาโหลดสดจากเน็ต
   (ข้อมูลของผู้ใช้อยู่ใน localStorage ไม่ถูกลบ) */
self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    try { const keys = await caches.keys(); await Promise.all(keys.map(function (k) { return caches.delete(k); })); } catch (err) {}
    try { await self.clients.claim(); } catch (err) {}
    try { await self.registration.unregister(); } catch (err) {}
    try {
      const cs = await self.clients.matchAll({ type: 'window' });
      cs.forEach(function (c) { try { c.navigate(c.url); } catch (err) {} });   // รีโหลดหน้าให้โหลดสด
    } catch (err) {}
  })());
});

// ไม่มี fetch handler โดยตั้งใจ → เบราว์เซอร์โหลดทุกไฟล์จากเครือข่ายตามปกติ (ได้ของใหม่เสมอ)
